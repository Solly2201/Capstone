export const legalSourceIds = [
  "constitution",
  "bns",
  "bnss",
  "bsa",
  "cpa2019",
  "it_act",
  "jj2015",
  "pwdva",
  "lsa",
  "rti"
] as const;

export type LegalSourceId = (typeof legalSourceIds)[number];

export type LegalSource = {
  label: string;
  actNo: string;
  unitLabel: string;
  officialUrl: string;
  publisher: string;
};

// Source provenance mirrors services/ai/data/legal-corpus/<id>/source.json.
// Keep the official URLs identical to the ingested corpus so an article
// citation and a document-browser result point at the same document.
export const legalSources: Record<LegalSourceId, LegalSource> = {
  constitution: {
    label: "Constitution of India",
    actNo: "",
    unitLabel: "Article",
    officialUrl: "https://www.indiacode.nic.in/bitstream/123456789/16124/1/the_constitution_of_india.pdf",
    publisher: "India Code / Ministry of Law and Justice"
  },
  bns: {
    label: "Bharatiya Nyaya Sanhita, 2023",
    actNo: "Act No. 45 of 2023",
    unitLabel: "Section",
    officialUrl: "https://www.indiacode.nic.in/bitstream/123456789/20062/1/a202345.pdf",
    publisher: "India Code / Ministry of Law and Justice"
  },
  bnss: {
    label: "Bharatiya Nagarik Suraksha Sanhita, 2023",
    actNo: "Act No. 46 of 2023",
    unitLabel: "Section",
    officialUrl: "https://www.indiacode.nic.in/bitstream/123456789/20099/1/A202346.pdf",
    publisher: "India Code / Ministry of Law and Justice"
  },
  bsa: {
    label: "Bharatiya Sakshya Adhiniyam, 2023",
    actNo: "Act No. 47 of 2023",
    unitLabel: "Section",
    officialUrl: "https://www.indiacode.nic.in/bitstream/123456789/20063/1/aa202347.pdf",
    publisher: "India Code / Ministry of Law and Justice"
  },
  cpa2019: {
    label: "Consumer Protection Act, 2019",
    actNo: "Act No. 35 of 2019",
    unitLabel: "Section",
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/18964",
    publisher: "India Code / Ministry of Law and Justice"
  },
  it_act: {
    label: "Information Technology Act, 2000",
    actNo: "Act No. 21 of 2000",
    unitLabel: "Section",
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/1999",
    publisher: "India Code / Ministry of Law and Justice"
  },
  jj2015: {
    label: "Juvenile Justice (Care and Protection of Children) Act, 2015",
    actNo: "Act No. 2 of 2016",
    unitLabel: "Section",
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/2148",
    publisher: "India Code / Ministry of Law and Justice"
  },
  pwdva: {
    label: "Protection of Women from Domestic Violence Act, 2005",
    actNo: "Act No. 43 of 2005",
    unitLabel: "Section",
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/2021",
    publisher: "India Code / Ministry of Law and Justice"
  },
  lsa: {
    label: "Legal Services Authorities Act, 1987",
    actNo: "Act No. 39 of 1987",
    unitLabel: "Section",
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/1925",
    publisher: "India Code / Ministry of Law and Justice"
  },
  rti: {
    label: "Right to Information Act, 2005",
    actNo: "Act No. 22 of 2005",
    unitLabel: "Section",
    // The Central Information Commission's own published copy, which is
    // also the exact file ingested into the corpus.
    officialUrl: "https://cic.gov.in/sites/default/files/RTI-Act_English.pdf",
    publisher: "Central Information Commission"
  }
};

export type Citation = {
  sourceId: LegalSourceId;
  unitNumber: string;
  label: string;
};

export type ArticleParagraph = {
  text: string;
  citation?: Citation;
};

export type LearnCategoryId =
  | "constitution"
  | "police-fir"
  | "arrest-bail"
  | "courts-and-evidence"
  | "everyday-rights"
  | "consumer-rights"
  | "digital-rights"
  | "women-and-safety"
  | "children-and-young-people"
  | "legal-aid"
  | "civic-participation"
  | "right-to-information";

export type LearningArticle = {
  slug: string;
  categoryId: LearnCategoryId;
  title: string;
  summary: string;
  /** What this article deliberately does not cover. */
  scopeNote?: string;
  paragraphs: ArticleParagraph[];
};

export type LearnCategory = {
  id: LearnCategoryId;
  title: string;
  description: string;
  /** Topics the ingested corpus cannot support yet, shown as an honest gap. */
  deferredTopics?: string[];
};

export type QuestionDifficulty = "easy" | "medium" | "hard";

export type QuestionFormat = "multiple-choice" | "true-false" | "scenario";

export type QuizOption = {
  /** Stable within a question; used as the React key and the answer value. */
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  /** The article this question is drawn from; must be an existing slug. */
  articleSlug: string;
  difficulty: QuestionDifficulty;
  format: QuestionFormat;
  /** Optional situation shown above the question, for scenario questions. */
  scenario?: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
  /**
   * Why the correct answer is correct, grounded in the same provision the
   * article cites. Shown after the learner answers, never before.
   */
  explanation: string;
  citation: Citation;
};

/**
 * A practical "what should I do?" question.
 *
 * Learning articles answer "what is this law?"; an FAQ answers "what do I
 * need to know if this happens to me?". The two are deliberately
 * different shapes, and an FAQ never duplicates an article -- it answers
 * the practical question briefly and links to the article for the detail.
 *
 * `legalBasis` reuses `ArticleParagraph`, so every substantive claim
 * carries the same citation structure -- and the same test that proves
 * article citations resolve to real corpus sections covers FAQs too.
 */
export type FaqUrgency = "emergency" | "serious";

export type Faq = {
  id: string;
  question: string;
  categoryId: LearnCategoryId;
  /** Two or three sentences a worried person can read first. */
  shortAnswer: string;
  /** Lawful, source-supported steps. Omitted where the source supports none. */
  whatYouCanDo?: string[];
  /** The provisions the answer rests on, each cited. */
  legalBasis: ArticleParagraph[];
  /** What this FAQ deliberately does not decide. Always present. */
  scopeNote: string;
  /** Slugs of learning articles that go deeper. */
  relatedArticles: string[];
  /** Citizen-language words people actually search for. */
  tags: string[];
  /**
   * Set when the situation may involve danger or live legal jeopardy, so
   * the page leads with contacting help rather than with the law.
   */
  urgency?: FaqUrgency;
};
