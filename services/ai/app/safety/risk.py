"""Deterministic query-safety policy for the legal-answer pipeline.

Runs BEFORE retrieval (see ``app.generation.pipeline.handle_legal_query``).
Rule-based only, by design -- no ML classifier, and the legal-answer
pipeline never uses a generative LLM at all (standing project decision,
see docs/PROJECT_STATE.md). Contact routes below are fixed configuration
data, not model-generated text, matching docs/LEGAL_SOURCES.md's
"Safety redirect sources" table.

Why this is not a keyword blacklist
-----------------------------------
The first version of this module was a flat list of phrases, and it
failed in both directions. It answered "How can I hide evidence from the
police?" as an ordinary legal question (no phrase covered it), while it
hard-stopped "Explain what the law says about domestic violence" with an
emergency redirect, because the bare phrase "domestic violence" was on
the list. Both failures have the same cause: a phrase says what a query
is *about*, and says nothing about what the person is *asking for*.
"Domestic violence" is simultaneously the name of a chapter of law a
citizen is entitled to learn about and the description of a situation
someone may be living through right now.

So this module reads three independent signals and combines them, rather
than matching one list:

``SUBJECT``
    What the query concerns, tiered by how much harm a wrong response
    could do: life-threatening subjects (threats to life, ongoing
    violence, self-harm, child endangerment, medical emergency) and
    serious-legal subjects (a live accusation, an interrogation, an
    imminent arrest, sexual violence). A subject alone never decides
    anything.

``FRAME``
    How the person is asking. *Informational* ("what does the law say
    about...", "what is the difference between...", "under which
    section...") means they are studying a topic. *Instructional* ("how
    do I...", "what should I say...", "help me...") means they want to be
    told what to do. *Personal* ("I was...", "my husband...", "they are
    questioning me") means they are describing their own situation.

``IMMEDIACY``
    Whether the situation is presented as live ("right now", "is
    happening", "about to", "tonight").

The combination decides the severity, and the decision table lives in one
place (:func:`assess_query`) so it can be read and tested as a policy
rather than reverse-engineered from a regex list.

Harmful-assistance requests are handled separately and first, because
they are the one case where the request itself decides the outcome:
asking to be shown *how* to destroy evidence, fabricate an alibi,
interfere with a witness or evade a police search is refused whatever the
framing. The detector still requires an instructional frame, so the
educational counterpart ("what is the punishment for destroying
evidence?", which BNS s.238 genuinely answers) goes to retrieval
untouched.

This is a deterministic v1 policy, not an exhaustive safety classifier.
It is conservative where the cost of a miss is physical harm, and
permissive where the cost of a false positive is blocking ordinary legal
education. Anything it does not recognise falls through to the existing
topic-relevance guard, corpus-coverage guard, retrieval and confidence
gate exactly as before.
"""
from __future__ import annotations

import re
from dataclasses import dataclass

# --- Severity levels ---------------------------------------------------
# Named constants so the pipeline, the API response model and the tests
# all refer to the same four states.
SEVERITY_EMERGENCY = "emergency"
SEVERITY_HARMFUL_REQUEST = "harmful_request"
SEVERITY_SERIOUS = "serious"
SEVERITY_NORMAL = "normal"

#: Every severity the policy can return, least to most restrictive.
SEVERITIES = (SEVERITY_NORMAL, SEVERITY_SERIOUS, SEVERITY_EMERGENCY, SEVERITY_HARMFUL_REQUEST)


def _compile(patterns: list[str]) -> list[re.Pattern[str]]:
    return [re.compile(p, re.IGNORECASE) for p in patterns]


def _any(compiled: list[re.Pattern[str]], text: str) -> bool:
    return any(p.search(text) for p in compiled)


# --- Signal 1: harmful assistance requests -----------------------------
# An "act" here is something the law itself treats as obstruction:
# destroying or concealing evidence, fabricating evidence or an alibi,
# interfering with a witness, absconding, or defeating a lawful search.
# Matched only together with an instructional frame (below), so the
# educational phrasing of the same subject is untouched.
_HARMFUL_ACTS = _compile([
    # Evidence destruction / concealment
    r"\b(hide|hiding|destroy|destroying|get rid of|dispose of|burn|delete|deleting|wipe|erase|erasing)\b"
    r"[^.?!]{0,40}\b(evidence|proof|weapon|body|documents?|records?|cctv|footage|messages?|chats?)\b",
    r"\b(evidence|proof|cctv footage|the weapon|the body)\b[^.?!]{0,25}\b(disappear|vanish|untraceable)\b",
    r"\bhide\b[^.?!]{0,25}\b(the )?(body|weapon|gun|knife|drugs?)\b",
    # Fabrication
    r"\b(fake|false|forged?|fabricat\w*|made[- ]up)\b[^.?!]{0,30}"
    r"\b(alibi|statement|affidavit|witness|receipt|document|evidence|fir|complaint|signature)\b",
    r"\b(create|creating|make|making|invent|manufacture|cook up|set up|build)\b[^.?!]{0,25}\b(an? )?alibi\b",
    r"\b(forge|forging)\b[^.?!]{0,25}\b(a |an |the )?(signature|document|certificate|id)\b",
    # Witness / complainant interference
    r"\b(threaten|threatening|bribe|bribing|silence|silencing|pressure|pressuring|intimidat\w*"
    r"|buy off|pay off)\b[^.?!]{0,30}"
    r"\b(witness(es)?|complainant|victim|informant|judge|magistrate|investigating officer)\b",
    r"\b(witness(es)?|complainant|victim)\b[^.?!]{0,25}\b(change|withdraw|retract)\b[^.?!]{0,25}\bstatement\b",
    r"\bmake\b[^.?!]{0,20}\bwitness\b[^.?!]{0,20}\b(lie|not testify|stay quiet)\b",
    # Evading law enforcement / absconding
    r"\b(avoid|avoiding|evade|evading|escape|escaping|dodge|dodging|run from|running from|abscond\w*"
    r"|stay away from|hide from)\b"
    r"[^.?!]{0,30}\b(police|arrest|the law|law enforcement|custody|summons|warrant|investigation)\b",
    r"\b(not get caught|never get caught|avoid getting caught|get away with (it|a crime|murder|theft|fraud))\b",
    r"\b(defeat|beat|trick|fool|get past|get around)\b[^.?!]{0,25}"
    r"\b(a |the )?(search|raid|police check|lie detector|polygraph|investigation)\b",
    # Lying to authorities
    r"\b(lie|lying)\b[^.?!]{0,25}\b(to the police|to the court|under oath|in my statement|to the magistrate)\b",
    r"\bfil(e|ing)\b[^.?!]{0,20}\b(a )?(false|fake) (fir|complaint|case|report)\b",
    # Instructions for committing serious harm
    r"\b(make|build|making|building)\b[^.?!]{0,20}\b(a )?(bomb|explosive|ied)\b",
    r"\b(hack|hacking|break)\b[^.?!]{0,25}\b(into )?(someone'?s?|another person'?s?|an?) "
    r"(account|phone|email|system|wifi|database)\b",
    r"\b(untraceable|without getting traced|without leaving (any )?evidence)\b",
])

# "Tell me how to do this", in the various ways citizens actually phrase
# it. Deliberately excludes "what is the punishment for" and "what does
# the law say about", which are the educational counterparts.
_INSTRUCTIONAL_FRAME = _compile([
    r"\bhow (do|can|could|should|would|might|to)\b",
    r"\bwhat('s| is) the (best|easiest|safest|quickest) way\b",
    r"\b(help|show|teach|tell|guide) me\b",
    r"\bany (way|ways|tips|tricks|advice) (to|for|on)\b",
    r"\bis there a way (to|i can)\b",
    r"\bwhat should (i|we|he|she|they) (do|say|tell)\b",
    r"\bi (want|need) to know how\b",
    r"\bgive me (a |the )?(steps|instructions|script|advice)\b",
    r"\bways? to\b",
])

# --- Signal 2: subject matter ------------------------------------------
# Tier A: a wrong or slow response risks physical harm to a person. Kept
# as named sub-groups rather than one flat list, because which official
# helpline the emergency response names depends on which group matched.
_SELF_HARM_SUBJECTS = _compile([
    r"\b(kill myself|end my life|want to die|take my own life|ending it all)\b",
    r"\bsuicid\w*\b",
    r"\b(hurt|harm|cutting) myself\b",
    r"\bself[- ]harm\b",
])

_MEDICAL_EMERGENCY_SUBJECTS = _compile([
    r"\b(heart attack|not breathing|stopped breathing|overdose|severe bleeding"
    r"|bleeding heavily|medical emergency|unconscious|collapsed)\b",
])

_CHILD_SAFETY_SUBJECTS = _compile([
    r"\b(child|minor|daughter|son|kid|baby)\b[^.?!]{0,30}"
    r"\b(is being|are being|being|is|was|were) (abused|beaten|molested|trafficked|hurt|starved|harmed)\b",
    r"\bchild (in danger|traffick\w*|abuse is happening)\b",
    r"\b(abus\w*|molest\w*|hurting|beating)\b[^.?!]{0,20}\b(my|a|the) (child|daughter|son|baby|minor)\b",
])

_THREAT_TO_LIFE_SUBJECTS = _compile([
    # Threats to life and ongoing violence
    r"\bthreaten\w*\b[^.?!]{0,30}\b(to kill|to murder|to hurt|to harm|my life|with a (knife|gun|weapon))\b",
    r"\b(going to|about to|will|gonna) (kill|murder|stab|shoot|attack|hurt) (me|us|my|him|her|them)\b",
    r"\b(is|are|am|being) (attacking|attacked|beating|stabbing|strangling|chasing) (me|us|her|him|them)\b",
    r"\b(is|are) (breaking into|forcing (his|her|their) way into)\b",
    r"\b(my life|our lives|her life|his life) (is|are) in danger\b",
    r"\bafraid (for my life|he will kill|she will kill|they will kill)\b",
    r"\b(death threat|threat to (my |her |his )?life)\b",
    # Kidnapping / wrongful confinement
    r"\b(kidnap\w*|abduct\w*)\b[^.?!]{0,30}\b(my|me|him|her|them|our|is missing|right now)\b",
    r"\b(locked|held|trapped|confined) (me|us|her|him|them)\b",
    r"\b(has|have|is|was) (been )?(kidnapped|abducted|taken away)\b",
])

_ACTIVE_CRIME_SUBJECTS = _compile([
    r"\b(witness(ing)?|watching|seeing) a (crime|robbery|murder|assault|stabbing|shooting)\b",
    r"\b(robbery|assault|shooting|stabbing|murder|riot|attack|break[- ]in) (is )?(happening|in progress|going on)\b",
    r"\bsomeone is (robbing|looting|vandalising|vandalizing|setting fire)\b",
])

_LIFE_THREATENING_SUBJECTS = (
    _SELF_HARM_SUBJECTS
    + _MEDICAL_EMERGENCY_SUBJECTS
    + _CHILD_SAFETY_SUBJECTS
    + _THREAT_TO_LIFE_SUBJECTS
    + _ACTIVE_CRIME_SUBJECTS
)

# Tier B: a real legal matter where personalised procedural coaching would
# be inappropriate, but nothing indicates immediate physical danger.
_SERIOUS_LEGAL_SUBJECTS = _compile([
    # Live accusation / charge / investigation
    r"\b(been|being) (accused|charged|booked|chargesheeted|framed|prosecuted)\b",
    r"\b(accused|charged|booked|framed) (me|us|my \w+)\b",
    r"\bcase (has been )?(filed|registered|lodged) against (me|us|my)\b",
    r"\b(fir|complaint|case|chargesheet) against (me|us|my \w+)\b",
    r"\b(i am|i'm|we are|we're) (under investigation|being investigated)\b",
    # Interrogation / custody / imminent arrest
    r"\b(police|cbi|officers?|investigating officer)\b[^.?!]{0,40}"
    r"\b(questioning|interrogating|summoned|detained|picked up|called) (me|us|him|her|my \w+)\b",
    r"\b(being|am|is|are) (questioned|interrogated|detained) by (the )?police\b",
    r"\b(at|in) the (police station|lock[- ]?up) (right )?now\b",
    r"\b(police are|police is|they are) (going to|about to|coming to) arrest\b",
    r"\b(about to be|going to be|will be) arrested\b",
    r"\bin (police |judicial )?custody\b",
    r"\b(raid|raided|searched)\b[^.?!]{0,25}\b(my|our) (house|home|office|shop)\b",
    # Sexual violence disclosed as a personal situation
    r"\b(i|she|he|they|my \w+) (was|were|has been|have been|got) (raped|sexually assaulted|molested)\b",
    r"\b(raped|sexually assaulted|molested) (me|her|him|them|my \w+)\b",
    # Serious personal criminal exposure
    r"\b(will|would|could|am|can) i (go to|be sent to) (jail|prison)\b",
    r"\bam i going to (jail|prison)\b",
    r"\bshould i (plead guilty|confess|surrender|sign|admit|say anything)\b",
    r"\bwhat (exactly )?should (i|we|he|she|they) (say|tell|answer)\b",
    r"\bmy (fir|case|complaint|bail|trial|hearing|chargesheet|arrest|conviction|sentence)\b",
    r"\b(i|we) (was|were|got|have been|had been) arrested\b",
    r"\bpolice arrested (me|us|my \w+)\b",
])

# Domestic abuse and cyber fraud sit between the tiers: they need their
# own route (a specific helpline, a specific portal) rather than the
# generic serious-matter message, but only when the person describes it
# as their own situation.
_DOMESTIC_ABUSE_SUBJECTS = _compile([
    r"\b(husband|wife|partner|spouse|in[- ]laws?|father|mother|brother|boyfriend|girlfriend)\b"
    r"[^.?!]{0,30}\b(hits?|hitting|beats?|beating|abus\w*|threaten\w*|starv\w*|burn\w*|assault\w*)\b"
    r"[^.?!]{0,15}\b(me|us|her|him)\b",
    r"\b(being|getting) (abused|beaten|hit|tortured)\b[^.?!]{0,25}\b(at home|by my|at my (house|home))\b",
    r"\b(i am|i'm|she is|he is) (a )?(victim of|facing|suffering|experiencing) domestic violence\b",
    r"\bdomestic violence (against|towards) (me|her|him|my)\b",
    r"\bmy (husband|wife|partner|in[- ]laws?) (is|are) (violent|abusive|beating me|hitting me)\b",
])

_CYBER_FRAUD_SUBJECTS = _compile([
    r"\b(my|our) (bank|upi|paytm|wallet) (account )?(was|has been|got|is) (hacked|compromised|emptied)\b",
    r"\b(i|we) (lost|was cheated of|were cheated of|got scammed out of) (money|rs\.?|inr|\d)",
    r"\b(someone|somebody|they|a scammer|a caller) (stole|took|withdrew|transferred|siphoned) money from (my|our)\b",
    r"\b(i|we) (was|were|got|have been) (scammed|defrauded|cheated) (online|on upi|by a caller|on a website)\b",
    r"\bfell for (an? )?(otp|upi|phishing|lottery|job) (scam|fraud)\b",
    r"\bmoney (was|has been|got) (debited|withdrawn|taken) from my (account|card|wallet)\b",
    r"\b(my|our) (photos?|videos?|account|profile) (was|were|has been|have been) (leaked|morphed|misused|hacked)\b",
])

# --- Signal 3: framing --------------------------------------------------
# The person is studying a topic rather than reporting a situation.
_INFORMATIONAL_FRAME = _compile([
    r"\bwhat (does|do|did) (the |indian |a |an )?(law|act|section|article|constitution|bns|bnss|bsa|code)\b",
    r"\bwhat (is|are|was|were) (a |an |the )?\w+",
    r"\bwhat counts as\b",
    r"\bexplain\b",
    r"\b(define|definition of|meaning of)\b",
    r"\b(difference|differences) between\b",
    r"\bunder (which|what) (section|article|act)\b",
    r"\bwhich (section|article|act|law)\b",
    r"\bwhat (rights|protections|remedies|provisions|punishment|penalty|penalties|procedure|happens)\b",
    r"\btell me about\b",
    r"\b(in general|generally speaking|in law|legally speaking)\b",
    r"\bhow does\b[^.?!]{0,30}\bwork\b",
    r"\bcan the police\b",
    r"\bis it (legal|illegal|an offence)\b",
])

# The person is describing their own (or a named relative's) situation.
_PERSONAL_FRAME = _compile([
    r"\b(i|we)\b[^.?!]{0,25}\b(was|were|am|are|have|has|had|got|need|want|face|facing|think|feel"
    r"|did|do|don't|can't|cannot)\b",
    r"\bmy (husband|wife|partner|son|daughter|child|kid|baby|father|mother|brother|sister|friend"
    r"|neighbour|neighbor|landlord|employer|boss|case|fir|complaint|account|house|home|family"
    r"|in[- ]laws?|phone|money|card|wallet|shop|office)\b",
    r"\b(happened to me|happening to me|done to me|against me|told me|arrested me|beat me|hit me"
    r"|threatened me|questioning me|following me)\b",
    r"\b(someone|somebody|a man|a woman|they|he|she) (is|has|was|just|are|have|were)\b",
    r"\bthey (are|were) \w+ing (me|us|my)\b",
    r"\b(help|save) (me|us)\b",
    r"\bwill i\b",
    r"\bam i\b",
])

# The situation is presented as live.
_IMMEDIACY = _compile([
    r"\bright now\b",
    r"\bat (the|this) moment\b",
    r"\bcurrently\b",
    r"\bas (i|we) (write|speak|type)\b",
    r"\b(is|are) happening\b",
    r"\bhappening (now|right now)\b",
    r"\b(about to|going to|coming to) (kill|hurt|attack|arrest|break in|come here)\b",
    r"\b(tonight|today|just now|a few minutes ago|minutes ago|moments ago)\b",
    r"\b(he|she|they)('s| is| are|'re) (here|outside|at the door|coming|banging)\b",
    r"\b(i'm|i am|we're|we are) (scared|terrified|in danger|hiding|trapped|bleeding)\b",
    r"\bplease help\b",
    r"\b(urgent|urgently|emergency)\b",
])


@dataclass(frozen=True)
class SafetyAssessment:
    """The outcome of the pre-retrieval safety policy.

    ``severity`` is one of the four ``SEVERITY_*`` constants. ``category``
    names the specific route taken -- it becomes the pipeline's ``reason``
    field and picks the helpline -- and is None only at normal severity.
    ``message`` is the fixed text to return, and is None at normal
    severity because a normal query is answered from retrieved law, not
    from a template.
    """

    severity: str
    category: str | None = None
    message: str | None = None
    #: Whether the response points at an authority, helpline or legal-aid
    #: service rather than at legal text alone.
    authority_guidance: bool = False

    @property
    def blocks_retrieval(self) -> bool:
        """True when no retrieval should happen at all.

        Emergencies and harmful-assistance requests hard-stop. Serious
        matters do not: showing someone the verbatim text of the law that
        governs their situation, behind the same confidence gate as any
        other query, is safe and useful. What is withheld from a serious
        matter is personalised procedural coaching, not the law itself.
        """
        return self.severity in (SEVERITY_EMERGENCY, SEVERITY_HARMFUL_REQUEST)


NORMAL_ASSESSMENT = SafetyAssessment(severity=SEVERITY_NORMAL)


# --- Fixed response text -----------------------------------------------
# Configuration data, not generated text. Only 112 (the national
# all-in-one emergency number), 181 (Women's Helpline), 1098 (Childline)
# and 1930 (Cyber Fraud Helpline) are named -- each an official national
# number listed in docs/LEGAL_SOURCES.md. No number is invented, and no
# local number is guessed.
EMERGENCY_CONTACTS: dict[str, str] = {
    "self_harm": (
        "This sounds like it may be a personal safety concern, not a legal "
        "information question, so I can't continue as a legal information "
        "chatbot for this message. If you are in danger or thinking about "
        "harming yourself, please contact 112 (Emergency) right away, or "
        "reach out to someone you trust immediately."
    ),
    "child_safety": (
        "This describes a possible child-safety emergency, not a legal "
        "information question. Please contact 112 (Emergency) or Childline "
        "at 1098 immediately. If a child is with you and in danger, get "
        "them somewhere safe first."
    ),
    "threat_to_life": (
        "This appears to describe an immediate threat to someone's safety, "
        "not a general legal information question. Please contact 112 "
        "(Emergency) or your local police right away, and move to a safe "
        "place if you can. Once you are safe, a lawyer or a legal services "
        "authority can help with the legal side."
    ),
    "domestic_violence": (
        "This describes a possible safety emergency at home, not a general "
        "legal information question. Please contact 112 (Emergency) or the "
        "Women's Helpline at 181 right away, and move somewhere safe if you "
        "can. A Protection Officer or a legal services authority can help "
        "with protection and residence orders once you are safe."
    ),
    "medical_emergency": (
        "This sounds like a medical emergency, not a legal information "
        "question. Please call 112 (Emergency) immediately."
    ),
    "active_crime": (
        "This appears to describe a crime in progress or someone in "
        "immediate danger, not a general legal information question. Please "
        "contact 112 (Emergency) or your local police right away, and get "
        "to a safe place if you can."
    ),
    "cyber_fraud": (
        "This describes a possible cybercrime or financial fraud. Please "
        "call 1930 (Cyber Fraud Helpline) or report it at the National "
        "Cyber Crime Reporting Portal (cybercrime.gov.in) as soon as you "
        "can -- reporting quickly matters for any chance of recovering "
        "money."
    ),
}

HARMFUL_REQUEST_MESSAGE = (
    "I can't help with this. Hiding or destroying evidence, fabricating "
    "statements or alibis, interfering with a witness, and evading a "
    "lawful investigation are themselves offences under Indian law, and "
    "they usually make a person's position much worse. If you are facing "
    "an investigation or an accusation, that is exactly the situation a "
    "defence lawyer exists for -- contact one, or India's free legal aid "
    "services (Tele-Law, Nyaya Bandhu, or your District Legal Services "
    "Authority), and ask what your options actually are."
)

SERIOUS_MATTER_MESSAGE = (
    "This appears to involve a serious legal matter affecting you "
    "directly. I can show you the general law on the topic, but I can't "
    "safely advise you on the specific steps to take in your case -- that "
    "depends on facts only a lawyer who hears your full account can weigh. "
    "Please contact a qualified lawyer, your District Legal Services "
    "Authority (free legal aid, under the Legal Services Authorities Act, "
    "1987), or the appropriate authority for case-specific assistance."
)

PERSONALIZED_ADVICE_MESSAGE = (
    "This looks like it's about your own specific situation rather than "
    "general legal information, and I'm not able to give personal legal "
    "advice or predict what will happen in your case. Please contact a "
    "qualified legal adviser, or India's free legal aid services -- "
    "Tele-Law or Nyaya Bandhu -- for guidance on your situation."
)


# --- Signal helpers ----------------------------------------------------

def _is_instructional(text: str) -> bool:
    return _any(_INSTRUCTIONAL_FRAME, text)


def _is_informational(text: str) -> bool:
    return _any(_INFORMATIONAL_FRAME, text)


def _is_personal(text: str) -> bool:
    return _any(_PERSONAL_FRAME, text)


def _is_immediate(text: str) -> bool:
    return _any(_IMMEDIACY, text)


def _life_threatening_subject(text: str) -> bool:
    return _any(_LIFE_THREATENING_SUBJECTS, text)


def _serious_legal_subject(text: str) -> bool:
    return _any(_SERIOUS_LEGAL_SUBJECTS, text)


def _requests_harmful_assistance(text: str) -> bool:
    """A harmful act *and* a request to be shown how to do it.

    Both halves are required. "What is the punishment for destroying
    evidence?" names the act but asks for the law, so it goes to
    retrieval; "How do I destroy evidence?" names the act and asks for
    instructions, so it is refused.
    """
    return _any(_HARMFUL_ACTS, text) and _is_instructional(text)


def _emergency_category(text: str) -> str | None:
    """Which emergency route a life-threatening query takes, if any.

    Checked most-specific first, so a query mentioning both a child and a
    general threat still gets the child-safety helpline.
    """
    if _any(_SELF_HARM_SUBJECTS, text):
        return "self_harm"
    if _any(_MEDICAL_EMERGENCY_SUBJECTS, text):
        return "medical_emergency"
    if _any(_CHILD_SAFETY_SUBJECTS, text):
        return "child_safety"
    # Checked before the generic threat route so that "my husband is
    # beating me" gets the Women's Helpline rather than the general
    # threat-to-life message -- both point at 112, but the specific
    # service is the more useful one to name first.
    if _any(_DOMESTIC_ABUSE_SUBJECTS, text):
        return "domestic_violence"
    if _any(_THREAT_TO_LIFE_SUBJECTS, text):
        return "threat_to_life"
    if _any(_ACTIVE_CRIME_SUBJECTS, text):
        return "active_crime"
    return None


def _is_purely_educational(text: str) -> bool:
    """The query reads as study, not as a report of a real situation.

    This is the guard that keeps ordinary legal education out of the
    emergency path: "Explain what the law says about domestic violence"
    is informational, impersonal and not urgent, so whatever heavy
    subject it names, it is a question about the law. Adding any personal
    or immediacy marker flips it back.
    """
    return _is_informational(text) and not _is_personal(text) and not _is_immediate(text)


# --- The policy --------------------------------------------------------

def assess_query(text: str) -> SafetyAssessment:
    """Classify a query's safety severity before any retrieval happens.

    The order below *is* the policy, and it matters:

    1. **Harmful assistance** -- refused regardless of anything else, so a
       request for obstruction techniques cannot be smuggled in under an
       emergency or educational framing.
    2. **Life-threatening subject, not purely educational** -- emergency
       redirect. A question about the same subject that is informational,
       impersonal and not urgent stays educational.
    3. **Domestic abuse / cyber fraud, presented as the person's own** --
       their own helpline routes, for the same reason: these need a
       specific service, not the generic message.
    4. **Serious legal subject, presented as personal** -- cautious
       response plus authority guidance. Retrieval still runs so the
       relevant law can be cited alongside the caution.
    5. Everything else -- normal, straight through to the existing
       topic-relevance guard, coverage guard, retrieval and confidence
       gate.
    """
    if _requests_harmful_assistance(text):
        return SafetyAssessment(
            severity=SEVERITY_HARMFUL_REQUEST,
            category="obstruction_or_fabrication",
            message=HARMFUL_REQUEST_MESSAGE,
            authority_guidance=True,
        )

    educational = _is_purely_educational(text)

    if (_life_threatening_subject(text) or _any(_DOMESTIC_ABUSE_SUBJECTS, text)) and not educational:
        category = _emergency_category(text) or "active_crime"
        return SafetyAssessment(
            severity=SEVERITY_EMERGENCY,
            category=category,
            message=EMERGENCY_CONTACTS[category],
            authority_guidance=True,
        )

    if _any(_CYBER_FRAUD_SUBJECTS, text) and not educational:
        return SafetyAssessment(
            severity=SEVERITY_EMERGENCY,
            category="cyber_fraud",
            message=EMERGENCY_CONTACTS["cyber_fraud"],
            authority_guidance=True,
        )

    if _serious_legal_subject(text) and not educational:
        return SafetyAssessment(
            severity=SEVERITY_SERIOUS,
            category="serious_legal_matter",
            message=SERIOUS_MATTER_MESSAGE,
            authority_guidance=True,
        )

    return NORMAL_ASSESSMENT


def classify_risk(text: str) -> str | None:
    """Backwards-compatible view of :func:`assess_query`.

    Returns the matched risk category, or None when the text reads as a
    general informational legal question.
    """
    return assess_query(text).category


#: Categories that hard-stop with an emergency/official-contact redirect.
EMERGENCY_CATEGORIES = set(EMERGENCY_CONTACTS)
