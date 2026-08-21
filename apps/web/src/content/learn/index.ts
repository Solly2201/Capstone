import { arrestBailArticles } from "./arrest-bail";
import { childrenArticles } from "./children-and-young-people";
import { civicParticipationArticles } from "./civic-participation";
import { constitutionArticles } from "./constitution";
import { consumerRightsArticles } from "./consumer-rights";
import { courtsAndEvidenceArticles } from "./courts-and-evidence";
import { digitalRightsArticles } from "./digital-rights";
import { everydayRightsArticles } from "./everyday-rights";
import { faqs as allFaqs } from "./faqs";
import { legalAidArticles } from "./legal-aid";
import { policeFirArticles } from "./police-fir";
import { rightToInformationArticles } from "./right-to-information";
import { quizQuestions as allQuizQuestions } from "./questions";
import { womenAndSafetyArticles } from "./women-and-safety";
import {
  legalSources,
  type Citation,
  type LearnCategory,
  type LearnCategoryId,
  type Faq,
  type LearningArticle,
  type LegalSourceId,
  type QuizQuestion
} from "./types";

export * from "./types";

export const learnCategories: LearnCategory[] = [
  {
    id: "constitution",
    title: "Constitution & Fundamental Rights",
    description:
      "What Part III of the Constitution guarantees, group by group, and the duties it places on citizens."
  },
  {
    id: "police-fir",
    title: "Police, FIR & Complaints",
    description:
      "How information about an offence is recorded, what a station must give you, and what to do if it refuses."
  },
  {
    id: "arrest-bail",
    title: "Arrest & Bail",
    description:
      "What the law requires during an arrest, the rights that attach in custody, and how bail works."
  },
  {
    id: "courts-and-evidence",
    title: "Courts, Trials & Evidence",
    description:
      "What a court can be shown and by whom: relevance and burden of proof, documents and electronic records, witnesses, confessions, and legal privilege."
  },
  {
    id: "everyday-rights",
    title: "Everyday Citizen Rights",
    description:
      "The offences behind ordinary disputes — cheating and forgery, theft, threats and reputation, and nuisance in your neighbourhood.",
    deferredTopics: [
      "Workplace and labour rights — no labour legislation has been ingested into this project's source library, so nothing here would be grounded in an official source.",
      "Tenancy and rent control — governed by State legislation that is not part of the ingested corpus."
    ]
  },
  {
    id: "consumer-rights",
    title: "Consumer Rights",
    description:
      "Who counts as a consumer, where a complaint is filed and within what time, how a case proceeds, mediation, product liability, and misleading advertisements."
  },
  {
    id: "digital-rights",
    title: "Digital & Online Rights",
    description:
      "Cybercrime and online fraud, identity theft, privacy in electronic form, harmful content, platform responsibility, and the legal standing of electronic records.",
    deferredTopics: [
      "Data protection — India's dedicated data-protection legislation is not part of this project's ingested source library, and sections 43 and 43A of the Information Technology Act are missing from the ingested PDF, so neither is summarised here."
    ]
  },
  {
    id: "women-and-safety",
    title: "Women's Safety & Domestic Violence",
    description:
      "What the law means by domestic violence, who must tell an aggrieved person her options, the orders a Magistrate can pass, and what happens if one is breached."
  },
  {
    id: "children-and-young-people",
    title: "Children & Young People",
    description:
      "The principles behind juvenile justice, how a child alleged to have broken the law is dealt with, children in need of care and protection, and offences against children.",
    deferredTopics: [
      "Sexual offences against children — governed principally by a separate statute that is not part of the ingested corpus."
    ]
  },
  {
    id: "legal-aid",
    title: "Legal Aid & Access to Justice",
    description:
      "Who is entitled to free legal services, the authorities that provide them, and the Lok Adalat and Permanent Lok Adalat settlement forums."
  },
  {
    id: "civic-participation",
    title: "Civic Participation",
    description:
      "Civic complaints and petitions on this platform, how they differ from a legal case, and how to use them well."
  },
  {
    id: "right-to-information",
    title: "Right to Information",
    description:
      "How to ask a public authority for information it holds, how long it has to answer, what it may withhold, and what to do when it refuses or stays silent.",
    deferredTopics: [
      "Fee amounts for an RTI application — the Act says only \"such fee as may be prescribed\"; the figures are set by rules made under the Act, which are not part of this project's source library.",
      "How long an Information Commissioner serves and on what terms — sections 13, 16 and 27 were replaced by the Right to Information (Amendment) Act, 2019, and the pre-2019 text is deliberately excluded from the corpus rather than shown as current law."
    ]
  }
];

// Order here is the order categories appear on the Learn page, and it is
// deliberate: the constitutional and criminal-procedure material first,
// then the subject areas a citizen is most likely to arrive looking for.
export const learningArticles: LearningArticle[] = [
  ...constitutionArticles,
  ...policeFirArticles,
  ...arrestBailArticles,
  ...courtsAndEvidenceArticles,
  ...everydayRightsArticles,
  ...consumerRightsArticles,
  ...digitalRightsArticles,
  ...womenAndSafetyArticles,
  ...childrenArticles,
  ...legalAidArticles,
  ...civicParticipationArticles,
  ...rightToInformationArticles
];

export const findCategory = (id: LearnCategoryId): LearnCategory | undefined =>
  learnCategories.find((category) => category.id === id);

export const findArticle = (slug: string | undefined): LearningArticle | undefined =>
  slug ? learningArticles.find((article) => article.slug === slug) : undefined;

export const articlesInCategory = (id: LearnCategoryId): LearningArticle[] =>
  learningArticles.filter((article) => article.categoryId === id);

/** Distinct sources cited by an article, in first-citation order. */
export const articleSourceIds = (article: LearningArticle): LegalSourceId[] => {
  const seen: LegalSourceId[] = [];
  for (const paragraph of article.paragraphs) {
    const id = paragraph.citation?.sourceId;
    if (id && !seen.includes(id)) seen.push(id);
  }
  return seen;
};

/** Case-insensitive match over title, summary and citation labels. */
/**
 * Words carrying no search signal. Dropped from a multi-word query so
 * that "no reply from office" is not required to contain "from".
 */
const searchStopwords = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "did", "do",
  "does", "for", "from", "get", "has", "have", "how", "i", "if", "in",
  "is", "it", "me", "my", "of", "on", "or", "that", "the", "to", "was",
  "what", "when", "where", "which", "who", "will", "with", "you", "your"
]);

/** Lowercase, strip apostrophes so "won't" and "wont" agree, split on non-letters. */
const searchTokens = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/['’]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

/**
 * Does `haystack` match `query`?
 *
 * An exact phrase match wins outright, which keeps every previous
 * result working. Failing that, every meaningful word in the query must
 * appear somewhere in the content -- an AND, not an OR, so the result
 * stays precise and unranked.
 *
 * The phrase-only version this replaces meant a multi-word citizen
 * phrasing found nothing unless it was a contiguous substring: "cops
 * won't file my complaint" returned zero results even though an FAQ
 * carries the tag "cops won't file", and "no reply from office"
 * returned zero against an FAQ tagged "no reply". That defeated the
 * point of the citizen-language tags, which exist precisely so people
 * can search in their own words.
 */
const contentMatches = (haystack: string, query: string): boolean => {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const hay = haystack.toLowerCase();
  if (hay.includes(needle)) return true;

  const hayTokens = new Set(searchTokens(hay));
  const wanted = searchTokens(needle).filter((t) => !searchStopwords.has(t));
  if (wanted.length === 0) return false;
  return wanted.every((token) => hayTokens.has(token));
};

export const matchesQuery = (article: LearningArticle, query: string): boolean =>
  contentMatches(
    [
      article.title,
      article.summary,
      article.scopeNote ?? "",
      // The body too. Searching only title and summary meant a whole
      // natural-language question could match nothing at all: "what is
      // the punishment for theft" found no article, because "punishment"
      // never appears in the title or summary of the article that
      // answers it.
      ...article.paragraphs.map((paragraph) => paragraph.text),
      ...article.paragraphs.map((paragraph) => paragraph.citation?.label ?? "")
    ].join(" "),
    query
  );

export const sourceLabel = (citation: Citation): string => legalSources[citation.sourceId].label;

// --- Related Learn content for cited provisions -------------------------
//
// The Legal Assistant's excerpts carry `chunk_id = "{source_id}:{unit}"`,
// and every Learn citation is the structured `{ sourceId, unitNumber }`
// in the same vocabulary (the source registry mirrors the corpus
// directories byte for byte). So "which Learn material covers this
// provision?" is an exact-key lookup over metadata that already exists —
// no similarity model, no invented relationships. A provision no Learn
// content cites simply maps to nothing.

/**
 * Splits an AI-service chunk id into a citation key, or null when it is
 * not one of this app's known sources. Split on the first colon only:
 * unit numbers never contain colons, but defensiveness costs nothing.
 */
export const parseChunkId = (
  chunkId: string
): { sourceId: LegalSourceId; unitNumber: string } | null => {
  const separator = chunkId.indexOf(":");
  if (separator <= 0) return null;
  const sourceId = chunkId.slice(0, separator) as LegalSourceId;
  const unitNumber = chunkId.slice(separator + 1);
  if (!unitNumber || !(sourceId in legalSources)) return null;
  return { sourceId, unitNumber };
};

const provisionKey = (sourceId: LegalSourceId, unitNumber: string): string =>
  `${sourceId}:${unitNumber}`;

// Built once from the static content arrays; order within each entry is
// authoring order, which the callers preserve.
const provisionIndex: Map<string, { articleSlugs: string[]; faqIds: string[] }> = (() => {
  const index = new Map<string, { articleSlugs: string[]; faqIds: string[] }>();
  const entryFor = (key: string) => {
    let entry = index.get(key);
    if (!entry) {
      entry = { articleSlugs: [], faqIds: [] };
      index.set(key, entry);
    }
    return entry;
  };
  for (const article of learningArticles) {
    for (const paragraph of article.paragraphs) {
      if (!paragraph.citation) continue;
      const entry = entryFor(provisionKey(paragraph.citation.sourceId, paragraph.citation.unitNumber));
      if (!entry.articleSlugs.includes(article.slug)) entry.articleSlugs.push(article.slug);
    }
  }
  for (const faq of allFaqs) {
    for (const paragraph of faq.legalBasis) {
      if (!paragraph.citation) continue;
      const entry = entryFor(provisionKey(paragraph.citation.sourceId, paragraph.citation.unitNumber));
      if (!entry.faqIds.includes(faq.id)) entry.faqIds.push(faq.id);
    }
  }
  return index;
})();

export type RelatedLearnContent = {
  articles: LearningArticle[];
  faqs: Faq[];
};

/**
 * The Learn articles and FAQs whose citations cover any of the given
 * chunk ids. Deduplicated, in the order the provisions were given and
 * then in authoring order. Empty arrays when nothing covers them — the
 * corpus is far larger than the Learn library, and an honest "nothing
 * yet" beats a loose topical guess.
 */
export const relatedLearnContent = (chunkIds: string[]): RelatedLearnContent => {
  const articleSlugs: string[] = [];
  const faqIds: string[] = [];
  for (const chunkId of chunkIds) {
    const parsed = parseChunkId(chunkId);
    if (!parsed) continue;
    const entry = provisionIndex.get(provisionKey(parsed.sourceId, parsed.unitNumber));
    if (!entry) continue;
    for (const slug of entry.articleSlugs) if (!articleSlugs.includes(slug)) articleSlugs.push(slug);
    for (const id of entry.faqIds) if (!faqIds.includes(id)) faqIds.push(id);
  }
  return {
    articles: articleSlugs
      .map((slug) => findArticle(slug))
      .filter((article): article is LearningArticle => article !== undefined),
    faqs: faqIds.map((id) => findFaq(id)).filter((faq): faq is Faq => faq !== undefined)
  };
};

// --- Quiz ---------------------------------------------------------------
// Questions live alongside the articles they are drawn from, and are
// looked up by article slug. There is no server round-trip and no stored
// progress: a quiz attempt is component state that lasts as long as the
// learner is on the page. That is a deliberate scope decision — a quiz
// score is not something this project needs to persist, and adding a
// backend for it would be a new subsystem for no benefit.

export const quizQuestions: QuizQuestion[] = allQuizQuestions;

/** Questions for one article, in the order they were authored. */
export const questionsForArticle = (slug: string): QuizQuestion[] =>
  quizQuestions.filter((question) => question.articleSlug === slug);

/** Questions for every article in a category, article order preserved. */
export const questionsInCategory = (id: LearnCategoryId): QuizQuestion[] =>
  articlesInCategory(id).flatMap((article) => questionsForArticle(article.slug));

export const findQuestion = (id: string | undefined): QuizQuestion | undefined =>
  id ? quizQuestions.find((question) => question.id === id) : undefined;

/**
 * Score an attempt. `answers` maps question id to the option id chosen;
 * a question with no entry counts as unanswered, which is not the same as
 * wrong for the purpose of `answered` but does count against `total`.
 */
export const scoreAttempt = (
  questions: QuizQuestion[],
  answers: Record<string, string>
): { correct: number; answered: number; total: number; percentage: number } => {
  let correct = 0;
  let answered = 0;
  for (const question of questions) {
    const choice = answers[question.id];
    if (choice === undefined) continue;
    answered += 1;
    if (choice === question.correctOptionId) correct += 1;
  }
  const total = questions.length;
  return {
    correct,
    answered,
    total,
    percentage: total === 0 ? 0 : Math.round((correct / total) * 100)
  };
};

// --- FAQs ---------------------------------------------------------------
// Practical "what should I do?" content, alongside the explanatory
// articles. Static and grounded exactly like the articles: the frontend
// never calls the AI service to render one, so an FAQ cannot change
// under a reader or say something the cited provision does not.

export const faqs: Faq[] = allFaqs;

export const findFaq = (id: string | undefined): Faq | undefined =>
  id ? faqs.find((faq) => faq.id === id) : undefined;

export const faqsInCategory = (id: LearnCategoryId): Faq[] =>
  faqs.filter((faq) => faq.categoryId === id);

/** Distinct sources cited by an FAQ, in first-citation order. */
export const faqSourceIds = (faq: Faq): LegalSourceId[] => {
  const seen: LegalSourceId[] = [];
  for (const paragraph of faq.legalBasis) {
    const id = paragraph.citation?.sourceId;
    if (id && !seen.includes(id)) seen.push(id);
  }
  return seen;
};

/**
 * Case-insensitive match over the question, the short answer, the tags
 * and the citation labels.
 *
 * Tags carry the citizen wording deliberately, so a search for "police
 * won't take my complaint" reaches the FAQ titled "The police won't
 * register my FIR" -- the same gap the retrieval normalisation layer
 * exists to close, solved here by indexing the words people use.
 */
export const faqMatchesQuery = (faq: Faq, query: string): boolean =>
  contentMatches(
    [
      faq.question,
      faq.shortAnswer,
      ...faq.tags,
      ...(faq.whatYouCanDo ?? []),
      ...faq.legalBasis.map((paragraph) => paragraph.text),
      ...faq.legalBasis.map((paragraph) => paragraph.citation?.label ?? "")
    ].join(" "),
    query
  );
