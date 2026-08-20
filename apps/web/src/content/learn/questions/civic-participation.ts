import type { QuizQuestion } from "../types";

export const civicParticipationQuestions: QuizQuestion[] = [
  {
    id: "civic-complaints-1",
    articleSlug: "civic-complaints",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "What is a civic report on this platform for?",
    options: [
      { id: "a", text: "Prosecuting a criminal offence" },
      { id: "b", text: "Reporting a local public service problem, such as a pothole" },
      { id: "c", text: "Claiming compensation for a defective product" },
      { id: "d", text: "Applying for free legal aid" }
    ],
    correctOptionId: "b",
    explanation:
      "A civic complaint is a report about a local public problem — a pothole, uncollected garbage, a dead street light, a water supply failure, road damage, drainage or sewage, or traffic and signage.",
    citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1) (for the contrasting police route)" }
  },
  {
    id: "civic-complaints-2",
    articleSlug: "civic-complaints",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "From what moment is a civic report's response deadline measured on this platform?",
    options: [
      { id: "a", text: "From when staff first open the record" },
      { id: "b", text: "From when a priority is assigned" },
      { id: "c", text: "From when the citizen submitted the report" },
      { id: "d", text: "From the start of the next working week" }
    ],
    correctOptionId: "c",
    explanation:
      "The deadline is measured from submission, not from when staff got round to the record, so the clock does not restart when the record is touched.",
    citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1) (for the contrasting police route)" }
  },
  {
    id: "civic-complaints-3",
    articleSlug: "civic-complaints",
    difficulty: "hard",
    format: "scenario",
    scenario:
      "Someone wants to report that a cognizable offence was committed against them, but the offence happened in a different area from where they now are.",
    prompt: "Which route applies, and what does the law require?",
    options: [
      { id: "a", text: "A civic report on this platform, because it covers every kind of local problem" },
      { id: "b", text: "A consumer complaint to a District Commission, because a service has failed" },
      { id: "c", text: "A petition on this platform, because public support has to be gathered first" },
      { id: "d", text: "A police station, whatever area the offence happened in" }
    ],
    correctOptionId: "d",
    explanation:
      "A civic complaint is about a service failure. Where the matter is a criminal offence, the route is a police station, and information about a cognizable offence may be given irrespective of the area where the offence was committed.",
    citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)" }
  },
  {
    id: "petitions-explained-1",
    articleSlug: "petitions-explained",
    difficulty: "easy",
    format: "true-false",
    prompt: "Reading a petition on this platform requires an account.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "a",
    explanation:
      "A petition is public content: reading one needs no account. Publishing, signing and moderating a petition all do require an account.",
    citation: { sourceId: "constitution", unitNumber: "19", label: "Constitution, Article 19(1)(a)-(b)" }
  },
  {
    id: "petitions-explained-2",
    articleSlug: "petitions-explained",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Which constitutional freedoms does the article identify as the basis for petitioning?",
    options: [
      { id: "a", text: "Freedom of religion and the right to property" },
      { id: "b", text: "Freedom of speech, and the right to assemble peaceably" },
      { id: "c", text: "The right to equality and the right against exploitation" },
      { id: "d", text: "The right to constitutional remedies alone" }
    ],
    correctOptionId: "b",
    explanation:
      "Petitions rest on Article 19(1)(a) and 19(1)(b) — the freedom of speech and expression and the right to assemble peaceably and without arms — subject to the reasonable restrictions the Constitution allows.",
    citation: { sourceId: "constitution", unitNumber: "19", label: "Constitution, Article 19(1)(a)-(b)" }
  },
  {
    id: "petitions-explained-3",
    articleSlug: "petitions-explained",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "What does reaching a petition's signature goal do on this platform?",
    options: [
      { id: "a", text: "It automatically obliges an authority to act" },
      { id: "b", text: "It closes the petition to further signatures" },
      { id: "c", text: "It signals priority to staff, and grants no privilege" },
      { id: "d", text: "It converts the petition into a legal case" }
    ],
    correctOptionId: "c",
    explanation:
      "The goal is the creator's own target. Reaching it is a triage signal for staff rather than an automatic trigger, and it grants no privilege.",
    citation: { sourceId: "constitution", unitNumber: "19", label: "Constitution, Article 19(1)(a)-(b)" }
  },
  {
    id: "complaint-vs-petition-vs-legal-case-1",
    articleSlug: "complaint-vs-petition-vs-legal-case",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "In criminal law, what does the word “complaint” precisely mean?",
    options: [
      { id: "a", text: "Any grievance sent in writing to a government department or public authority" },
      { id: "b", text: "A police report submitted to a Magistrate on completion of an investigation" },
      { id: "c", text: "A petition addressed to an authority and signed by more than one person" },
      { id: "d", text: "An allegation made to a Magistrate, other than a police report" }
    ],
    correctOptionId: "d",
    explanation:
      "Section 2(1)(h) defines a complaint as any allegation made orally or in writing to a Magistrate, with a view to the Magistrate taking action under the Sanhita, that some person has committed an offence — and it expressly excludes a police report.",
    citation: { sourceId: "bnss", unitNumber: "2", label: "BNSS, Section 2(1)(h)" }
  },
  {
    id: "complaint-vs-petition-vs-legal-case-2",
    articleSlug: "complaint-vs-petition-vs-legal-case",
    difficulty: "medium",
    format: "scenario",
    scenario:
      "Someone paid for a service that was performed badly, and wants redress.",
    prompt: "Which route fits best?",
    options: [
      { id: "a", text: "A consumer complaint to a District Commission" },
      { id: "b", text: "A civic report to the municipal authority" },
      { id: "c", text: "A petition seeking public support" },
      { id: "d", text: "A writ petition in the High Court" }
    ],
    correctOptionId: "a",
    explanation:
      "Where a product or service paid for was defective or deficient, the consumer route applies — a complaint to a District Commission, subject to the two-year limitation period from the cause of action.",
    citation: { sourceId: "cpa2019", unitNumber: "35", label: "Consumer Protection Act, Sections 35 and 69" }
  },
  {
    id: "complaint-vs-petition-vs-legal-case-3",
    articleSlug: "complaint-vs-petition-vs-legal-case",
    difficulty: "hard",
    format: "true-false",
    prompt: "Using the Consumer Protection Act rules out pursuing a remedy under any other law.",
    options: [
      { id: "a", text: "True" },
      { id: "b", text: "False" }
    ],
    correctOptionId: "b",
    explanation:
      "Section 100 states that the Act's provisions are in addition to, and not in derogation of, the provisions of any other law for the time being in force — so these routes are not mutually exclusive.",
    citation: { sourceId: "cpa2019", unitNumber: "100", label: "Consumer Protection Act, Section 100" }
  },
  {
    id: "participating-effectively-1",
    articleSlug: "participating-effectively",
    difficulty: "easy",
    format: "true-false",
    prompt: "A person who gives first information at a police station must ask, and pay, for a copy of it.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "a",
    explanation:
      "A copy of the information as recorded must be given forthwith, free of cost, to the informant or the victim.",
    citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(2)" }
  },
  {
    id: "participating-effectively-2",
    articleSlug: "participating-effectively",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "If a police station refuses to record information about a cognizable offence, what escalation does the Sanhita itself provide?",
    options: [
      { id: "a", text: "Repeating the request at the same station the next day" },
      { id: "b", text: "Publishing the complaint online" },
      { id: "c", text: "Filing a civic report on this platform" },
      { id: "d", text: "Writing to the Superintendent of Police with the substance of it" }
    ],
    correctOptionId: "d",
    explanation:
      "Section 173(4) allows the informant to send the substance of the information, in writing and by post, to the Superintendent of Police concerned.",
    citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(4)" }
  },
  {
    id: "participating-effectively-3",
    articleSlug: "participating-effectively",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "Which of these does Article 51A list as a duty of every citizen?",
    options: [
      { id: "a", text: "To safeguard public property and to abjure violence" },
      { id: "b", text: "To sign at least one petition each year" },
      { id: "c", text: "To report every civic problem to a Magistrate" },
      { id: "d", text: "To pay for public services in advance" }
    ],
    correctOptionId: "a",
    explanation:
      "Article 51A lists duties including safeguarding public property and abjuring violence, protecting and improving the natural environment, promoting harmony and the spirit of common brotherhood, and developing the scientific temper and spirit of inquiry and reform.",
    citation: { sourceId: "constitution", unitNumber: "51A", label: "Constitution, Article 51A" }
  }
];
