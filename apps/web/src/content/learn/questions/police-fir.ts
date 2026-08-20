import type { QuizQuestion } from "../types";

export const policeFirQuestions: QuizQuestion[] = [
  {
    id: "cognizable-vs-non-cognizable-1",
    articleSlug: "cognizable-vs-non-cognizable",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "What is the defining feature of a cognizable offence?",
    options: [
      { id: "a", text: "A police officer may arrest without a warrant" },
      { id: "b", text: "It can only be tried by a Court of Session" },
      { id: "c", text: "It always carries a sentence of life imprisonment" },
      { id: "d", text: "It can only be reported in writing" }
    ],
    correctOptionId: "a",
    explanation:
      "A cognizable offence is one for which a police officer may, in accordance with the First Schedule or any other law, arrest without a warrant.",
    citation: { sourceId: "bnss", unitNumber: "2", label: "BNSS, Section 2(1)(g)" }
  },
  {
    id: "cognizable-vs-non-cognizable-2",
    articleSlug: "cognizable-vs-non-cognizable",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "What must a police officer do when information about a non-cognizable offence is given at a station?",
    options: [
      { id: "a", text: "Begin investigating immediately without any order" },
      { id: "b", text: "Enter the substance in a book, and refer the informant on" },
      { id: "c", text: "Refuse to record it" },
      { id: "d", text: "Arrest the person named without a warrant" }
    ],
    correctOptionId: "b",
    explanation:
      "For a non-cognizable case the officer enters or causes to be entered the substance of the information in the prescribed book and refers the informant to the Magistrate. No police officer may investigate a non-cognizable case without the order of a Magistrate having power to try it.",
    citation: { sourceId: "bnss", unitNumber: "174", label: "BNSS, Section 174(1)-(2)" }
  },
  {
    id: "cognizable-vs-non-cognizable-3",
    articleSlug: "cognizable-vs-non-cognizable",
    difficulty: "hard",
    format: "scenario",
    scenario:
      "A case involves two or more offences, of which at least one is cognizable and the others are not.",
    prompt: "How is such a case treated?",
    options: [
      { id: "a", text: "Each offence is treated separately and investigated on its own footing" },
      { id: "b", text: "The whole case is deemed a cognizable case" },
      { id: "c", text: "The whole case is deemed a non-cognizable case" },
      { id: "d", text: "The Magistrate must first decide which offence dominates" }
    ],
    correctOptionId: "b",
    explanation:
      "Where a case relates to two or more offences of which at least one is cognizable, the case is deemed to be a cognizable case notwithstanding that the other offences are non-cognizable.",
    citation: { sourceId: "bnss", unitNumber: "174", label: "BNSS, Section 174(4)" }
  },
  {
    id: "what-is-an-fir-1",
    articleSlug: "what-is-an-fir",
    difficulty: "easy",
    format: "true-false",
    prompt: "Information about a cognizable offence must be recorded only if the offence took place within that police station's own area.",
    options: [
      { id: "a", text: "True" },
      { id: "b", text: "False" }
    ],
    correctOptionId: "b",
    explanation:
      "Information about a cognizable offence must be recorded irrespective of the area where the offence is committed — the basis of the Zero FIR.",
    citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)" }
  },
  {
    id: "what-is-an-fir-2",
    articleSlug: "what-is-an-fir",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "When information about a cognizable offence is given orally, what must the officer do?",
    options: [
      { id: "a", text: "Summarise it in the daily diary only" },
      { id: "b", text: "Reduce it to writing and read it over to the informant" },
      { id: "c", text: "Ask the informant to return with a written statement" },
      { id: "d", text: "Forward the informant to a Magistrate first" }
    ],
    correctOptionId: "b",
    explanation:
      "Oral information must be reduced to writing by the officer or under their direction and read over to the informant, who then signs it.",
    citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)" }
  },
  {
    id: "what-is-an-fir-3",
    articleSlug: "what-is-an-fir",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "What does the law say about giving the informant a copy of the recorded information?",
    options: [
      { id: "a", text: "A copy is given free of cost to the informant" },
      { id: "b", text: "A copy is given only on payment of the prescribed fee" },
      { id: "c", text: "A copy is given only after the investigation is complete" },
      { id: "d", text: "A copy is given only if a Magistrate directs it" }
    ],
    correctOptionId: "a",
    explanation:
      "A copy of the information as recorded is to be given forthwith, free of cost, to the informant or the victim.",
    citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(2)" }
  },
  {
    id: "fir-vs-ncr-1",
    articleSlug: "fir-vs-ncr",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "What is the main practical difference between an FIR and a non-cognizable report?",
    options: [
      { id: "a", text: "One is written and the other is oral" },
      { id: "b", text: "One starts a police investigation; the other needs a Magistrate's order first" },
      { id: "c", text: "One is free and the other is paid for" },
      { id: "d", text: "One can be filed by a victim and the other only by a witness" }
    ],
    correctOptionId: "b",
    explanation:
      "An FIR records a cognizable offence and the police may investigate; a non-cognizable entry is referred to the Magistrate, and no police investigation happens without the Magistrate's order.",
    citation: { sourceId: "bnss", unitNumber: "174", label: "BNSS, Section 174" }
  },
  {
    id: "fir-vs-ncr-2",
    articleSlug: "fir-vs-ncr",
    difficulty: "medium",
    format: "true-false",
    prompt: "A police officer may refuse to make any record at all if the offence described is non-cognizable.",
    options: [
      { id: "a", text: "True" },
      { id: "b", text: "False" }
    ],
    correctOptionId: "b",
    explanation:
      "The Sanhita requires the substance of the information to be entered in the prescribed book even for a non-cognizable offence, and the informant referred to the Magistrate.",
    citation: { sourceId: "bnss", unitNumber: "174", label: "BNSS, Section 174(1)" }
  },
  {
    id: "fir-vs-ncr-3",
    articleSlug: "fir-vs-ncr",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "Once a Magistrate orders investigation into a non-cognizable case, what powers does the investigating officer have?",
    options: [
      { id: "a", text: "The same powers, except arrest without warrant" },
      { id: "b", text: "Only the power to record statements" },
      { id: "c", text: "No investigative powers at all" },
      { id: "d", text: "The powers of a Magistrate" }
    ],
    correctOptionId: "a",
    explanation:
      "On such an order the officer may exercise the same powers in respect of the investigation as in a cognizable case, except the power to arrest without warrant.",
    citation: { sourceId: "bnss", unitNumber: "174", label: "BNSS, Section 174(3)" }
  },
  {
    id: "zero-fir-1",
    articleSlug: "zero-fir",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "What is a Zero FIR?",
    options: [
      { id: "a", text: "An FIR recorded by a station regardless of where the offence took place" },
      { id: "b", text: "An FIR that carries no case number because it was rejected" },
      { id: "c", text: "An FIR filed by a person with no evidence" },
      { id: "d", text: "An FIR that a Magistrate has quashed" }
    ],
    correctOptionId: "a",
    explanation:
      "The term describes an FIR recorded irrespective of the area where the offence was committed, which is then transferred to the station with jurisdiction.",
    citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)" }
  },
  {
    id: "zero-fir-2",
    articleSlug: "zero-fir",
    difficulty: "medium",
    format: "scenario",
    scenario:
      "Someone is robbed while travelling and reaches a police station in a different district that evening.",
    prompt: "What does the law require of that station?",
    options: [
      { id: "a", text: "To send the person back to the district where it happened" },
      { id: "b", text: "To record it, since jurisdiction is not a precondition" },
      { id: "c", text: "To record it only if a senior officer approves" },
      { id: "d", text: "To record it only in writing signed by two witnesses" }
    ],
    correctOptionId: "b",
    explanation:
      "Information about a cognizable offence must be recorded irrespective of the area where it was committed; the record is then forwarded to the station with jurisdiction.",
    citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)" }
  },
  {
    id: "zero-fir-3",
    articleSlug: "zero-fir",
    difficulty: "hard",
    format: "true-false",
    prompt: "Recording a Zero FIR means the recording station must itself complete the investigation.",
    options: [
      { id: "a", text: "True" },
      { id: "b", text: "False" }
    ],
    correctOptionId: "b",
    explanation:
      "Recording is separated from jurisdiction. The information is recorded wherever it is given, and then transferred to the police station having jurisdiction over the offence.",
    citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)" }
  },
  {
    id: "how-to-file-an-fir-1",
    articleSlug: "how-to-file-an-fir",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "In what forms may information about a cognizable offence be given?",
    options: [
      { id: "a", text: "Only in writing, signed in person" },
      { id: "b", text: "Orally or by electronic communication" },
      { id: "c", text: "Only through a lawyer" },
      { id: "d", text: "Only on a prescribed printed form" }
    ],
    correctOptionId: "b",
    explanation:
      "Every information relating to the commission of a cognizable offence, irrespective of the area where the offence is committed, may be given orally or by electronic communication to an officer in charge of a police station.",
    citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)" }
  },
  {
    id: "how-to-file-an-fir-2",
    articleSlug: "how-to-file-an-fir",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Information given by electronic communication is taken on record when?",
    options: [
      { id: "a", text: "Immediately on receipt, without more" },
      { id: "b", text: "When it is signed by the person giving it within three days" },
      { id: "c", text: "Only after a Magistrate verifies it" },
      { id: "d", text: "Only after the informant appears in person before a Judge" }
    ],
    correctOptionId: "b",
    explanation:
      "Information given by electronic communication is taken on record when it is signed by the person giving it within three days.",
    citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)" }
  },
  {
    id: "how-to-file-an-fir-3",
    articleSlug: "how-to-file-an-fir",
    difficulty: "hard",
    format: "true-false",
    prompt: "A person giving information about a cognizable offence must sign the record that is read over to them.",
    options: [
      { id: "a", text: "True" },
      { id: "b", text: "False" }
    ],
    correctOptionId: "a",
    explanation:
      "Where information is given orally it is reduced to writing, read over to the informant, and signed by the person giving it.",
    citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)" }
  },
  {
    id: "if-police-refuse-an-fir-1",
    articleSlug: "if-police-refuse-an-fir",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "If an officer in charge of a police station refuses to record information about a cognizable offence, whom may the informant approach?",
    options: [
      { id: "a", text: "The Superintendent of Police" },
      { id: "b", text: "The Chief Minister's office" },
      { id: "c", text: "The nearest hospital administration" },
      { id: "d", text: "A private complaints ombudsman" }
    ],
    correctOptionId: "a",
    explanation:
      "The informant may send the substance of the information, in writing and by post, to the Superintendent of Police concerned.",
    citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(4)" }
  },
  {
    id: "if-police-refuse-an-fir-2",
    articleSlug: "if-police-refuse-an-fir",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "What may the Superintendent of Police do on being satisfied that the information discloses a cognizable offence?",
    options: [
      { id: "a", text: "Investigate personally, or direct a subordinate to do so" },
      { id: "b", text: "Convict the accused directly" },
      { id: "c", text: "Order the informant to pay a filing fee" },
      { id: "d", text: "Refer the matter to the High Court for permission" }
    ],
    correctOptionId: "a",
    explanation:
      "If satisfied that the information discloses the commission of a cognizable offence, the Superintendent shall either investigate the case personally or direct an investigation by a subordinate police officer.",
    citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(4)" }
  },
  {
    id: "if-police-refuse-an-fir-3",
    articleSlug: "if-police-refuse-an-fir",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "Besides approaching a senior officer, what other route exists for a person whose complaint is not recorded?",
    options: [
      { id: "a", text: "Taking a complaint of the facts directly to a Magistrate" },
      { id: "b", text: "Filing a petition in the Supreme Court as the only remedy" },
      { id: "c", text: "Requesting the police to reconsider after thirty days" },
      { id: "d", text: "Publishing the complaint publicly, which compels an FIR" }
    ],
    correctOptionId: "a",
    explanation:
      "A Magistrate may take cognizance of an offence upon receiving a complaint of facts constituting it — a route that does not depend on a police report.",
    citation: { sourceId: "bnss", unitNumber: "210", label: "BNSS, Section 210(1)(a)" }
  },
  {
    id: "what-happens-after-an-fir-1",
    articleSlug: "what-happens-after-an-fir",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "What does an investigating officer send to the Magistrate on completing an investigation?",
    options: [
      { id: "a", text: "A police report in the prescribed form" },
      { id: "b", text: "A signed confession from the accused" },
      { id: "c", text: "A copy of the case diary only" },
      { id: "d", text: "A verbal summary at the next hearing" }
    ],
    correctOptionId: "a",
    explanation:
      "As soon as the investigation is completed, the officer in charge forwards a report — including by electronic communication — to a Magistrate empowered to take cognizance of the offence on a police report, in the form the State Government provides by rules.",
    citation: { sourceId: "bnss", unitNumber: "193", label: "BNSS, Section 193(3)(i)" }
  },
  {
    id: "what-happens-after-an-fir-2",
    articleSlug: "what-happens-after-an-fir",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "What happens if, on investigation, the evidence is found deficient?",
    options: [
      { id: "a", text: "The accused must still be sent for trial" },
      { id: "b", text: "The accused may be released on a bond to appear if required" },
      { id: "c", text: "The FIR is deleted from the record" },
      { id: "d", text: "The informant is prosecuted automatically" }
    ],
    correctOptionId: "b",
    explanation:
      "Where it appears there is not sufficient evidence or reasonable ground of suspicion to justify forwarding the accused to a Magistrate, the officer releases the accused on their executing a bond to appear if and when required.",
    citation: { sourceId: "bnss", unitNumber: "189", label: "BNSS, Section 189" }
  },
  {
    id: "what-happens-after-an-fir-3",
    articleSlug: "what-happens-after-an-fir",
    difficulty: "hard",
    format: "true-false",
    prompt: "The informant has no right to be told the outcome of the investigation.",
    options: [
      { id: "a", text: "True" },
      { id: "b", text: "False" }
    ],
    correctOptionId: "b",
    explanation:
      "The officer must communicate the action taken, in the manner the State Government prescribes by rules, to the person by whom the information relating to the commission of the offence was first given.",
    citation: { sourceId: "bnss", unitNumber: "193", label: "BNSS, Section 193(3)(iii)" }
  },
  {
    id: "complaint-to-a-magistrate-1",
    articleSlug: "complaint-to-a-magistrate",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "On which of these may a Magistrate take cognizance of an offence?",
    options: [
      { id: "a", text: "Only on a police report" },
      { id: "b", text: "On a complaint, a police report, or other information" },
      { id: "c", text: "Only on a written complaint by a public servant" },
      { id: "d", text: "Only where the accused consents" }
    ],
    correctOptionId: "b",
    explanation:
      "A Magistrate may take cognizance upon a complaint of facts constituting the offence, upon a police report, or upon information from a person other than a police officer or the Magistrate's own knowledge.",
    citation: { sourceId: "bnss", unitNumber: "210", label: "BNSS, Section 210(1)" }
  },
  {
    id: "complaint-to-a-magistrate-2",
    articleSlug: "complaint-to-a-magistrate",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "What must a Magistrate ordinarily do before taking cognizance on a complaint?",
    options: [
      { id: "a", text: "Examine the complainant and any witnesses present upon oath" },
      { id: "b", text: "Order an arrest to secure the accused's attendance" },
      { id: "c", text: "Obtain the Superintendent of Police's written consent" },
      { id: "d", text: "Publish notice of the complaint in a newspaper" }
    ],
    correctOptionId: "a",
    explanation:
      "The Magistrate examines the complainant and the witnesses present upon oath, and the substance of that examination is reduced to writing and signed by all of them and the Magistrate.",
    citation: { sourceId: "bnss", unitNumber: "223", label: "BNSS, Section 223(1)" }
  },
  {
    id: "complaint-to-a-magistrate-3",
    articleSlug: "complaint-to-a-magistrate",
    difficulty: "hard",
    format: "scenario",
    scenario:
      "After examining the complainant and considering an inquiry, a Magistrate concludes there is no sufficient ground for proceeding.",
    prompt: "What must the Magistrate do?",
    options: [
      { id: "a", text: "Transfer the complaint to the police for an FIR" },
      { id: "b", text: "Dismiss the complaint and briefly record the reasons" },
      { id: "c", text: "Adjourn the matter indefinitely" },
      { id: "d", text: "Issue process anyway, leaving the question to trial" }
    ],
    correctOptionId: "b",
    explanation:
      "Where the Magistrate is of opinion that there is no sufficient ground for proceeding, the complaint is dismissed, and in every such case the reasons must be briefly recorded.",
    citation: { sourceId: "bnss", unitNumber: "226", label: "BNSS, Section 226" }
  },
  {
    id: "search-and-seizure-basics-1",
    articleSlug: "search-and-seizure-basics",
    difficulty: "easy",
    format: "true-false",
    prompt: "A police officer searching a place during an investigation must first record the grounds of belief in the case-diary.",
    options: [
      { id: "a", text: "True" },
      { id: "b", text: "False" }
    ],
    correctOptionId: "a",
    explanation:
      "The officer may search only after recording in writing the grounds of belief in the case-diary and specifying, so far as possible, the thing to be searched for.",
    citation: { sourceId: "bnss", unitNumber: "185", label: "BNSS, Section 185(1)" }
  },
  {
    id: "search-and-seizure-basics-2",
    articleSlug: "search-and-seizure-basics",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Where a woman is to be searched during a search of premises, what does the law require?",
    options: [
      { id: "a", text: "The search must be made by another woman, with strict regard to decency" },
      { id: "b", text: "The search may only be made in the presence of a Magistrate" },
      { id: "c", text: "The search must be postponed until the next day" },
      { id: "d", text: "The search requires a separate warrant in every case" }
    ],
    correctOptionId: "a",
    explanation:
      "Where a person in or about the place is reasonably suspected of concealing an article, they may be searched — and if that person is a woman, the search shall be made by another woman with strict regard to decency.",
    citation: { sourceId: "bnss", unitNumber: "103", label: "BNSS, Section 103(3)" }
  },
  {
    id: "search-and-seizure-basics-3",
    articleSlug: "search-and-seizure-basics",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "What does the Sanhita require about recording the process of a search and seizure?",
    options: [
      { id: "a", text: "A handwritten summary signed by the officer alone" },
      { id: "b", text: "Audio-video recording, forwarded to a Magistrate" },
      { id: "c", text: "Photographs only, retained at the police station" },
      { id: "d", text: "No recording, provided witnesses are present" }
    ],
    correctOptionId: "b",
    explanation:
      "The process of search and seizure, including preparation and signing of the list of things seized, shall be recorded through audio-video electronic means — preferably a mobile phone — and forwarded without delay to the District Magistrate, Sub-divisional Magistrate or Judicial Magistrate of the first class.",
    citation: { sourceId: "bnss", unitNumber: "105", label: "BNSS, Section 105" }
  }
];
