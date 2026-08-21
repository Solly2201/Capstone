"""Deterministic multi-turn context resolution -- no LLM, no inference.

The Legal Assistant is stateless per request; the browser sends back the
previous question it asked, and this module decides three things, by
rules alone:

1. Is the new message a *follow-up* -- a fragment that only means
   something relative to the previous question ("what if I'm a minor?",
   "and at night?") -- or a standalone question?
2. If it is a follow-up, can it be resolved *safely*? Resolution here is
   pure text composition: the previous question and the new condition are
   concatenated into one retrieval query. Nothing is inferred, reworded
   or generated -- if the two texts together don't retrieve the right
   provision, the pipeline abstains exactly as it would for any other
   under-specified query.
3. If it is follow-up-shaped but carries no usable content of its own
   ("what about this?", "and then?"), or there is no previous question to
   resolve against, the caller asks for a full question instead of
   guessing. Context must never manufacture legal meaning.

A standalone question always wins: context is only consulted when the
new message cannot stand on its own, so a new topic is never dragged
back to an old one.

The resolved text is used for RETRIEVAL GATING AND SEARCH ONLY. The
answer is still assembled verbatim from retrieved chunks, and every
safety guard runs against the resolved text as well as the raw one
(see generation/pipeline.py) -- client-supplied context is untrusted
input and cannot talk retrieval past a guard.
"""
from __future__ import annotations

import re
from dataclasses import dataclass

# Openers that mark a message as depending on what came before. Matched
# at the start of the (lowercased, trimmed) message only: "what if I am
# arrested?" mid-sentence is not a follow-up marker.
#
# "what happens if/when" is deliberately NOT here: "what happens when
# you're arrested?" is a complete standalone question with the same
# content-token count as a genuine follow-up, and misreading it costs an
# answer, while missing a follow-up merely degrades to fragment
# retrieval. When in doubt, standalone wins.
_FOLLOW_UP_OPENERS = (
    "what if",
    "what about",
    "how about",
    "and if",
    "and what if",
    "and what about",
    "but what if",
    "but if",
    "even if",
    "in that case",
    "then what",
    "and then",
    "what then",
    "does that",
    "is that",
    "can they still",
    "can i still",
    "would that",
    "same question",
)

# Pronouns and pro-forms that, standing alone, refer to something earlier.
_ANAPHORA_ONLY = re.compile(
    r"^(what|how|and|but|so|then|why|really|ok|okay)?[\s,]*"
    r"(about|regarding)?[\s,]*"
    r"(this|that|it|them|those|these|him|her|the same)?[\s?.!]*$"
)

# Words that carry no retrieval signal on their own; what remains after
# removing them is the follow-up's actual new content. Auxiliaries and
# desire verbs ("cannot", "want") are included: "what if I cannot afford
# a lawyer?" contributes "afford lawyer", not four content words.
_STOPWORDS = frozenset(
    """a an and are am as at be but by can cannot cant could couldnt do does doesnt did didnt
    dont for from get has have how i if in is isnt arent it me my need no not of on or so
    that the then there this to want was we what when where which who will wont would should
    shouldnt with you your they their them he she his her him its about happens happen
    happened still same case what's whats im i'm ive id also even than then""".split()
)

# Third-person pro-forms: inside a follow-up-shaped message they refer to
# something in the previous exchange ("what if he breaks it?"). First
# person is deliberately excluded -- "I"/"my" always mean the asker and
# prove nothing about dependence on earlier turns.
_THIRD_PERSON = frozenset("it they them he she him her that those this".split())

# Leading words that mark a bare condition fragment ("and at night?",
# "without a warrant?", "as a minor?").
_FRAGMENT_LEADS = frozenset("and or but as at in on with without for after before during".split())

_TOKEN = re.compile(r"[a-z0-9']+")


@dataclass(frozen=True)
class ConversationContext:
    """What the client sends back from the previous exchange. Untrusted."""

    previous_question: str


@dataclass(frozen=True)
class ContextResolution:
    #: The text the pipeline should gate and retrieve on.
    retrieval_question: str
    #: True when the previous question was folded in.
    context_applied: bool
    #: True when the message needs the user to restate a full question.
    needs_clarification: bool


CLARIFICATION_MESSAGE = (
    "This looks like a follow-up, but there isn't enough here to know what it refers to. "
    "Please ask again as a complete question with the details included — for example, "
    "“Can the police arrest a minor without a warrant?” rather than “what about a minor?”."
)


def _content_tokens(text: str) -> list[str]:
    return [token for token in _TOKEN.findall(text.lower()) if token not in _STOPWORDS]


def _opens_as_follow_up(text: str) -> bool:
    lowered = text.strip().lower()
    return any(lowered.startswith(opener) for opener in _FOLLOW_UP_OPENERS)


def is_follow_up(question: str) -> bool:
    """Follow-up-shaped, by four deterministic signals:

    1. Nothing but anaphora ("what about this?").
    2. A dependent opener whose message contributes little content of its
       own ("what if I'm a minor?") OR refers back with a third-person
       pro-form ("what if he breaks it?"). The opener alone is NOT
       enough: "what happens if I refuse to tell police my name" opens
       like a follow-up yet is a complete question, and stays standalone.
    3. A bare condition fragment led by a conjunction or preposition
       ("and at night?", "without a warrant?").
    4. A short content-poor message whose only subject is a third-person
       pro-form ("how long do they have?").
    """
    stripped = question.strip()
    if not stripped:
        return False
    lowered = stripped.lower()
    if _ANAPHORA_ONLY.match(lowered):
        return True

    tokens = _TOKEN.findall(lowered)
    content = [token for token in tokens if token not in _STOPWORDS]
    has_third_person = any(token in _THIRD_PERSON for token in tokens)

    if _opens_as_follow_up(stripped):
        return len(content) <= 2 or has_third_person
    if tokens and tokens[0] in _FRAGMENT_LEADS and len(tokens) <= 6 and len(content) <= 2:
        return True
    return has_third_person and len(tokens) <= 6 and len(content) <= 2


def resolve_context(question: str, context: ConversationContext | None) -> ContextResolution:
    """Decide what retrieval should actually search for.

    Standalone question -> passed through untouched, context ignored.
    Follow-up with content and a previous question -> the two texts
    concatenated (composition, not interpretation).
    Follow-up without content, or without a previous question -> ask the
    user to restate; nothing is guessed.
    """
    if not is_follow_up(question):
        return ContextResolution(retrieval_question=question, context_applied=False, needs_clarification=False)

    new_content = _content_tokens(question)
    previous = (context.previous_question if context else "").strip()

    if not previous or not new_content:
        return ContextResolution(retrieval_question=question, context_applied=False, needs_clarification=True)

    # Pure concatenation: every word of both questions reaches retrieval,
    # none is invented. Trailing punctuation on the previous question is
    # kept -- tokenisers ignore it, and the joined text stays readable
    # when shown back to the user.
    combined = f"{previous} {question.strip()}"
    return ContextResolution(retrieval_question=combined, context_applied=True, needs_clarification=False)
