import type { QuizQuestion } from "../types";

export const courtsAndEvidenceQuestions: QuizQuestion[] = [
  {
    id: "what-evidence-means-1",
    articleSlug: "what-evidence-means",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Of what may evidence be given in a suit or proceeding?",
    options: [
      { id: "a", text: "Any fact a party considers important" },
      { id: "b", text: "Facts in issue and facts declared relevant, and no others" },
      { id: "c", text: "Only facts admitted by both sides" },
      { id: "d", text: "Only facts recorded in a public document" }
    ],
    correctOptionId: "b",
    explanation:
      "Evidence may be given of the existence or non-existence of every fact in issue and of such other facts as are declared relevant — and of no others.",
    citation: { sourceId: "bsa", unitNumber: "3", label: "BSA, Section 3" }
  },
  {
    id: "what-evidence-means-2",
    articleSlug: "what-evidence-means",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "What does it mean that oral evidence must be “direct”?",
    options: [
      { id: "a", text: "It must be given without a lawyer present" },
      { id: "b", text: "It must be given in the witness's mother tongue" },
      { id: "c", text: "A fact that could be seen must come from a witness who saw it" },
      { id: "d", text: "It must be reduced to writing before the hearing" }
    ],
    correctOptionId: "c",
    explanation:
      "Section 55 requires that a fact which could be seen be proved by a witness who saw it, a fact which could be heard by a witness who heard it, and so on for each sense — and an opinion by the person who holds it.",
    citation: { sourceId: "bsa", unitNumber: "55", label: "BSA, Section 55" }
  },
  {
    id: "what-evidence-means-3",
    articleSlug: "what-evidence-means",
    difficulty: "hard",
    format: "scenario",
    scenario:
      "A person accused of an offence says their case falls within one of the General Exceptions in the Bharatiya Nyaya Sanhita.",
    prompt: "Who bears the burden of proving those circumstances?",
    options: [
      { id: "a", text: "The prosecution, as with every other element" },
      { id: "b", text: "Neither side; the Court decides on its own inquiry" },
      { id: "c", text: "The investigating officer" },
      { id: "d", text: "The accused, and the Court presumes they are absent" }
    ],
    correctOptionId: "d",
    explanation:
      "Section 108 places the burden of proving circumstances bringing the case within a General Exception on the accused, and the Court shall presume the absence of such circumstances.",
    citation: { sourceId: "bsa", unitNumber: "108", label: "BSA, Section 108" }
  },
  {
    id: "documents-and-electronic-records-1",
    articleSlug: "documents-and-electronic-records",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "What is primary evidence of a document?",
    options: [
      { id: "a", text: "The document itself produced for the Court's inspection" },
      { id: "b", text: "A certified copy issued by a public officer" },
      { id: "c", text: "A witness's oral account of its contents" },
      { id: "d", text: "A written admission by the other party" }
    ],
    correctOptionId: "a",
    explanation:
      "Primary evidence means the document itself produced for the inspection of the Court. Certified copies, oral accounts and written admissions are secondary evidence.",
    citation: { sourceId: "bsa", unitNumber: "57", label: "BSA, Section 57" }
  },
  {
    id: "documents-and-electronic-records-2",
    articleSlug: "documents-and-electronic-records",
    difficulty: "medium",
    format: "true-false",
    prompt: "A record may be excluded from evidence simply because it is in electronic form.",
    options: [
      { id: "a", text: "True" },
      { id: "b", text: "False" }
    ],
    correctOptionId: "b",
    explanation:
      "Nothing in the Adhiniyam denies the admissibility of an electronic or digital record on the ground that it is electronic; subject to the admissibility conditions, it has the same legal effect and validity as any other document.",
    citation: { sourceId: "bsa", unitNumber: "61", label: "BSA, Section 61" }
  },
  {
    id: "documents-and-electronic-records-3",
    articleSlug: "documents-and-electronic-records",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "Where an electronic record is stored simultaneously or sequentially across multiple files, what is the status of each such file?",
    options: [
      { id: "a", text: "Each is secondary evidence only" },
      { id: "b", text: "Only the earliest file is admissible" },
      { id: "c", text: "Each is primary evidence" },
      { id: "d", text: "None is admissible without the original device" }
    ],
    correctOptionId: "c",
    explanation:
      "Explanation 4 to section 57 provides that where an electronic or digital record is created or stored, and that storage occurs simultaneously or sequentially in multiple files, each such file is primary evidence.",
    citation: { sourceId: "bsa", unitNumber: "57", label: "BSA, Section 57, Explanation 4" }
  },
  {
    id: "witnesses-and-cross-examination-1",
    articleSlug: "witnesses-and-cross-examination",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Examination of a witness by the party who called them is called what?",
    options: [
      { id: "a", text: "Cross-examination" },
      { id: "b", text: "Re-examination" },
      { id: "c", text: "Deposition" },
      { id: "d", text: "Examination-in-chief" }
    ],
    correctOptionId: "d",
    explanation:
      "Section 142 names the three stages: examination-in-chief by the party calling the witness, cross-examination by the adverse party, and re-examination afterwards by the party who called them.",
    citation: { sourceId: "bsa", unitNumber: "142", label: "BSA, Section 142" }
  },
  {
    id: "witnesses-and-cross-examination-2",
    articleSlug: "witnesses-and-cross-examination",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "When may leading questions be asked freely?",
    options: [
      { id: "a", text: "In cross-examination" },
      { id: "b", text: "In examination-in-chief" },
      { id: "c", text: "In re-examination" },
      { id: "d", text: "Never, in any stage" }
    ],
    correctOptionId: "a",
    explanation:
      "Leading questions may be asked in cross-examination. In examination-in-chief and re-examination they must not be asked if the adverse party objects, except with the Court's permission.",
    citation: { sourceId: "bsa", unitNumber: "146", label: "BSA, Section 146" }
  },
  {
    id: "witnesses-and-cross-examination-3",
    articleSlug: "witnesses-and-cross-examination",
    difficulty: "hard",
    format: "scenario",
    scenario:
      "In a prosecution for a sexual offence where the question of consent is in issue, the defence wants to lead evidence of the victim's previous sexual experience.",
    prompt: "What does the Adhiniyam provide?",
    options: [
      { id: "a", text: "Such evidence is relevant if it concerns the accused" },
      { id: "b", text: "Such evidence is not relevant to consent or the quality of consent" },
      { id: "c", text: "Such evidence is relevant only with the victim's permission" },
      { id: "d", text: "Such evidence is relevant if led by a woman advocate" }
    ],
    correctOptionId: "b",
    explanation:
      "Section 48 provides that in such prosecutions, where consent is in issue, evidence of the victim's character or of their previous sexual experience with any person is not relevant on the issue of consent or the quality of consent.",
    citation: { sourceId: "bsa", unitNumber: "48", label: "BSA, Section 48" }
  },
  {
    id: "confessions-and-police-statements-1",
    articleSlug: "confessions-and-police-statements",
    difficulty: "easy",
    format: "true-false",
    prompt: "A confession made to a police officer may be proved against the person accused.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "a",
    explanation:
      "No confession made to a police officer shall be proved as against a person accused of any offence.",
    citation: { sourceId: "bsa", unitNumber: "23", label: "BSA, Section 23(1)" }
  },
  {
    id: "confessions-and-police-statements-2",
    articleSlug: "confessions-and-police-statements",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Before recording a confession, what must a Magistrate do?",
    options: [
      { id: "a", text: "Obtain the written consent of the investigating officer in the case" },
      { id: "b", text: "Order a medical examination of the person before recording anything" },
      { id: "c", text: "Grant bail to the person before the confession is recorded" },
      { id: "d", text: "Explain that they need not confess, and that it may be used" }
    ],
    correctOptionId: "d",
    explanation:
      "The Magistrate must explain that the person is not bound to make a confession and that if they do, it may be used as evidence against them — and must not record it unless satisfied it is being made voluntarily.",
    citation: { sourceId: "bnss", unitNumber: "183", label: "BNSS, Section 183(2)" }
  },
  {
    id: "confessions-and-police-statements-3",
    articleSlug: "confessions-and-police-statements",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "A person examined by the police during an investigation must answer truly — with what exception?",
    options: [
      { id: "a", text: "Questions whose answers would tend to incriminate them" },
      { id: "b", text: "Questions about the conduct of other people involved in the case" },
      { id: "c", text: "Questions put to them after sunset or before sunrise" },
      { id: "d", text: "Questions about documents or records that are in their own possession" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 180(2) binds the person to answer truly all questions relating to the case, other than questions the answers to which would have a tendency to expose them to a criminal charge or to a penalty or forfeiture.",
    citation: { sourceId: "bnss", unitNumber: "180", label: "BNSS, Section 180(2)" }
  },
  {
    id: "privileged-communications-1",
    articleSlug: "privileged-communications",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Without the client's express consent, what may an advocate not disclose?",
    options: [
      { id: "a", text: "Their own fee arrangements" },
      { id: "b", text: "Communications made for their professional service" },
      { id: "c", text: "The date of the next hearing" },
      { id: "d", text: "The name of the court seized of the matter" }
    ],
    correctOptionId: "b",
    explanation:
      "Section 132 forbids an advocate, unless with the client's express consent, from disclosing communications made in the course and for the purpose of their service, the contents of documents they became acquainted with in that service, or the advice they gave.",
    citation: { sourceId: "bsa", unitNumber: "132", label: "BSA, Section 132(1)" }
  },
  {
    id: "privileged-communications-2",
    articleSlug: "privileged-communications",
    difficulty: "medium",
    format: "true-false",
    prompt: "An advocate's obligation of confidentiality ends when the professional service ends.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "a",
    explanation:
      "The Explanation to section 132 states expressly that the obligation continues after the professional service has ceased.",
    citation: { sourceId: "bsa", unitNumber: "132", label: "BSA, Section 132, Explanation" }
  },
  {
    id: "privileged-communications-3",
    articleSlug: "privileged-communications",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "Which of these falls outside the protection given by section 132?",
    options: [
      { id: "a", text: "Advice about how to defend a pending charge" },
      { id: "b", text: "The client's account of past events" },
      { id: "c", text: "Documents shown to the advocate for the case" },
      { id: "d", text: "A communication made in furtherance of an illegal purpose" }
    ],
    correctOptionId: "d",
    explanation:
      "The proviso excludes from protection any communication made in furtherance of an illegal purpose, and any fact observed by the advocate in the course of service showing that a crime or fraud has been committed since the service began.",
    citation: { sourceId: "bsa", unitNumber: "132", label: "BSA, Section 132(1), proviso" }
  }
];
