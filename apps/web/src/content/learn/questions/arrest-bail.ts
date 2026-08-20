import type { QuizQuestion } from "../types";

export const arrestBailQuestions: QuizQuestion[] = [
  {
    id: "what-happens-when-arrested-1",
    articleSlug: "what-happens-when-arrested",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "For how long may a police officer detain a person arrested without warrant, absent a Magistrate's special order?",
    options: [
      { id: "a", text: "Twenty-four hours, excluding journey time to the Magistrate's court" },
      { id: "b", text: "Twelve hours from the moment of arrest" },
      { id: "c", text: "Forty-eight hours, excluding the journey to court" },
      { id: "d", text: "Seven days, or longer with the officer in charge's approval" }
    ],
    correctOptionId: "a",
    explanation:
      "No police officer shall detain a person arrested without warrant longer than is reasonable, and that period shall not, absent a special order of a Magistrate, exceed twenty-four hours exclusive of the time necessary for the journey to the Magistrate's court.",
    citation: { sourceId: "bnss", unitNumber: "58", label: "BNSS, Section 58" }
  },
  {
    id: "what-happens-when-arrested-2",
    articleSlug: "what-happens-when-arrested",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "What does the law say about arresting a woman after sunset and before sunrise?",
    options: [
      { id: "a", text: "It is prohibited without exception" },
      { id: "b", text: "It is permitted only in exceptional circumstances" },
      { id: "c", text: "It is permitted freely if a male officer is present" },
      { id: "d", text: "It is permitted only where the offence is bailable" }
    ],
    correctOptionId: "b",
    explanation:
      "Save in exceptional circumstances, no woman shall be arrested after sunset and before sunrise. The rule is a restriction with a narrow exception, not an absolute bar.",
    citation: { sourceId: "bnss", unitNumber: "43", label: "BNSS, Section 43(5)" }
  },
  {
    id: "what-happens-when-arrested-3",
    articleSlug: "what-happens-when-arrested",
    difficulty: "hard",
    format: "scenario",
    scenario:
      "A woman is to be arrested, and the arresting police officer is male. There is nothing to indicate she is resisting.",
    prompt: "What does the Sanhita provide about physically touching her to make the arrest?",
    options: [
      { id: "a", text: "The officer may touch her if a witness is present" },
      { id: "b", text: "The officer must handcuff her in every case" },
      { id: "c", text: "Her submission is presumed, and the officer shall not touch her" },
      { id: "d", text: "The arrest is invalid unless a Magistrate is present" }
    ],
    correctOptionId: "c",
    explanation:
      "Where a woman is to be arrested, unless the circumstances indicate otherwise, her submission to custody on an oral intimation of arrest is presumed, and unless circumstances require otherwise or the officer is female, the officer shall not touch her person to make the arrest.",
    citation: { sourceId: "bnss", unitNumber: "43", label: "BNSS, Section 43(1), proviso" }
  },
  {
    id: "rights-of-an-arrested-person-1",
    articleSlug: "rights-of-an-arrested-person",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Under Article 22(1), what is an arrested person entitled to?",
    options: [
      { id: "a", text: "To be released immediately on asking the arresting officer to do so" },
      { id: "b", text: "To refuse to be produced before a Magistrate until a lawyer is present" },
      { id: "c", text: "To have the case against them heard and decided on the same day" },
      { id: "d", text: "To be told the grounds of arrest, and to consult a lawyer" }
    ],
    correctOptionId: "d",
    explanation:
      "Article 22(1) provides that no person arrested shall be detained without being informed, as soon as may be, of the grounds of arrest, nor denied the right to consult and be defended by a legal practitioner of their choice.",
    citation: { sourceId: "constitution", unitNumber: "22", label: "Constitution, Article 22(1)" }
  },
  {
    id: "rights-of-an-arrested-person-2",
    articleSlug: "rights-of-an-arrested-person",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Whom must the arresting officer inform about the arrest and the place of detention?",
    options: [
      { id: "a", text: "A person the arrested person nominates, and a designated officer" },
      { id: "b", text: "Only the Magistrate, at the first hearing after the arrested person is produced" },
      { id: "c", text: "Only the arrested person's employer, so that their absence can be explained" },
      { id: "d", text: "No one at all, until the investigation has been completed and a report filed" }
    ],
    correctOptionId: "a",
    explanation:
      "The officer must forthwith give information about the arrest and the place of detention to a relative, friend or other person nominated by the arrested person, and to the designated police officer in the district.",
    citation: { sourceId: "bnss", unitNumber: "48", label: "BNSS, Section 48(1)" }
  },
  {
    id: "rights-of-an-arrested-person-3",
    articleSlug: "rights-of-an-arrested-person",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "What duty does the Sanhita place on the Magistrate before whom an arrested person is produced?",
    options: [
      { id: "a", text: "To grant bail in every case" },
      { id: "b", text: "To satisfy themselves that the intimation rules were followed" },
      { id: "c", text: "To record a confession from the person" },
      { id: "d", text: "To order a further period of police custody" }
    ],
    correctOptionId: "b",
    explanation:
      "It is the duty of the Magistrate before whom the arrested person is produced to satisfy themselves that the requirements about informing a relative or friend, and making the station entry, have been complied with.",
    citation: { sourceId: "bnss", unitNumber: "48", label: "BNSS, Section 48(4)" }
  },
  {
    id: "what-is-bail-1",
    articleSlug: "what-is-bail",
    difficulty: "easy",
    format: "true-false",
    prompt: "Bail means the case against a person has been dropped.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "a",
    explanation:
      "Bail is release from custody on conditions, on execution of a bond or bail bond. The proceedings continue; only the custody ends.",
    citation: { sourceId: "bnss", unitNumber: "2", label: "BNSS, Section 2(1)(b)" }
  },
  {
    id: "what-is-bail-2",
    articleSlug: "what-is-bail",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Where a person accused of a bailable offence is indigent and unable to furnish surety, what does the Sanhita direct?",
    options: [
      { id: "a", text: "They remain in custody until trial" },
      { id: "b", text: "The State must pay their surety amount" },
      { id: "c", text: "Bail is refused until a lawyer is appointed" },
      { id: "d", text: "They are discharged on a bond for their appearance" }
    ],
    correctOptionId: "d",
    explanation:
      "The officer or Court shall, if the person is indigent and unable to furnish surety, discharge them on executing a bond for their appearance instead of taking a bail bond.",
    citation: { sourceId: "bnss", unitNumber: "478", label: "BNSS, Section 478(1), proviso" }
  },
  {
    id: "what-is-bail-3",
    articleSlug: "what-is-bail",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "After how long without furnishing a bail bond may a person be presumed indigent for this purpose?",
    options: [
      { id: "a", text: "One week from the date of arrest" },
      { id: "b", text: "Twenty-four hours from arrest" },
      { id: "c", text: "One month from the date of arrest" },
      { id: "d", text: "Only after a means test by the Court" }
    ],
    correctOptionId: "a",
    explanation:
      "The Explanation says that where a person is unable to give a bail bond within a week of the date of arrest, that is a sufficient ground to presume they are indigent for the purposes of the proviso.",
    citation: { sourceId: "bnss", unitNumber: "478", label: "BNSS, Section 478(1), Explanation" }
  },
  {
    id: "bailable-vs-non-bailable-1",
    articleSlug: "bailable-vs-non-bailable",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "What is the key difference between a bailable and a non-bailable offence?",
    options: [
      { id: "a", text: "A non-bailable offence can never result in release before trial" },
      { id: "b", text: "In a bailable offence bail is a right; otherwise it is discretionary" },
      { id: "c", text: "A bailable offence is always tried by a Magistrate" },
      { id: "d", text: "A non-bailable offence requires no FIR" }
    ],
    correctOptionId: "b",
    explanation:
      "For a bailable offence, a person prepared to give bail shall be released. For a non-bailable offence, release is possible but subject to statutory restrictions and the Court's satisfaction.",
    citation: { sourceId: "bnss", unitNumber: "478", label: "BNSS, Sections 2(1)(c) and 478(1)" }
  },
  {
    id: "bailable-vs-non-bailable-2",
    articleSlug: "bailable-vs-non-bailable",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Bail in a non-bailable case shall not be granted if there appear reasonable grounds for believing the person is guilty of an offence punishable with what?",
    options: [
      { id: "a", text: "Any term of imprisonment" },
      { id: "b", text: "A fine exceeding one lakh rupees" },
      { id: "c", text: "Death or imprisonment for life" },
      { id: "d", text: "Imprisonment exceeding one year" }
    ],
    correctOptionId: "c",
    explanation:
      "A person shall not be released on bail if there appear reasonable grounds for believing they have been guilty of an offence punishable with death or imprisonment for life.",
    citation: { sourceId: "bnss", unitNumber: "480", label: "BNSS, Section 480(1)(i)" }
  },
  {
    id: "bailable-vs-non-bailable-3",
    articleSlug: "bailable-vs-non-bailable",
    difficulty: "hard",
    format: "scenario",
    scenario:
      "A person falls within one of the categories where bail is ordinarily barred in a non-bailable case, but she is a woman.",
    prompt: "What does the Sanhita allow the Court to do?",
    options: [
      { id: "a", text: "Nothing — the bar is absolute in all cases" },
      { id: "b", text: "Release only with the Public Prosecutor's written consent" },
      { id: "c", text: "Release only after the charge sheet is filed" },
      { id: "d", text: "Direct release on bail, as for a child or a sick person" }
    ],
    correctOptionId: "d",
    explanation:
      "A proviso allows the Court to direct that a person falling in clause (i) or (ii) be released on bail if that person is a child, a woman, or is sick or infirm.",
    citation: { sourceId: "bnss", unitNumber: "480", label: "BNSS, Section 480(1), proviso" }
  },
  {
    id: "regular-vs-anticipatory-bail-1",
    articleSlug: "regular-vs-anticipatory-bail",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "To which courts may a person apprehending arrest apply for anticipatory bail?",
    options: [
      { id: "a", text: "The High Court or the Court of Session" },
      { id: "b", text: "Any Judicial Magistrate of the first class" },
      { id: "c", text: "The Supreme Court only" },
      { id: "d", text: "The officer in charge of the police station" }
    ],
    correctOptionId: "a",
    explanation:
      "A person with reason to believe they may be arrested on an accusation of a non-bailable offence may apply to the High Court or the Court of Session for a direction that, in the event of arrest, they be released on bail.",
    citation: { sourceId: "bnss", unitNumber: "482", label: "BNSS, Section 482(1)" }
  },
  {
    id: "regular-vs-anticipatory-bail-2",
    articleSlug: "regular-vs-anticipatory-bail",
    difficulty: "medium",
    format: "true-false",
    prompt: "Anticipatory bail can be granted before any arrest has taken place.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "b",
    explanation:
      "That is exactly what distinguishes it. The direction is made in advance, and it takes effect in the event of the arrest happening.",
    citation: { sourceId: "bnss", unitNumber: "482", label: "BNSS, Section 482(1)" }
  },
  {
    id: "regular-vs-anticipatory-bail-3",
    articleSlug: "regular-vs-anticipatory-bail",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "Which of these is a condition the Court may attach to a direction for anticipatory bail?",
    options: [
      { id: "a", text: "That the person surrender their passport permanently" },
      { id: "b", text: "That the person plead guilty at the first hearing" },
      { id: "c", text: "That the person be available for interrogation when required" },
      { id: "d", text: "That the person pay compensation to the complainant in advance" }
    ],
    correctOptionId: "c",
    explanation:
      "The conditions expressly listed include availability for interrogation, not directly or indirectly inducing or threatening a person acquainted with the facts, and not leaving India without the Court's previous permission.",
    citation: { sourceId: "bnss", unitNumber: "482", label: "BNSS, Section 482(2)" }
  },
  {
    id: "bail-procedure-basics-1",
    articleSlug: "bail-procedure-basics",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Which courts have special powers regarding bail beyond those of an ordinary Magistrate?",
    options: [
      { id: "a", text: "Only the Supreme Court" },
      { id: "b", text: "The Executive Magistrate alone" },
      { id: "c", text: "Consumer Commissions" },
      { id: "d", text: "The High Court and the Court of Session" }
    ],
    correctOptionId: "d",
    explanation:
      "The High Court or Court of Session may direct that any accused person be released on bail, and may impose, set aside or vary conditions.",
    citation: { sourceId: "bnss", unitNumber: "483", label: "BNSS, Section 483(1)" }
  },
  {
    id: "bail-procedure-basics-2",
    articleSlug: "bail-procedure-basics",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "An undertrial prisoner has been detained for one-half of the maximum imprisonment specified for the offence, which does not carry death or life imprisonment. What follows?",
    options: [
      { id: "a", text: "They shall be released by the Court on bail" },
      { id: "b", text: "They must serve the full maximum term" },
      { id: "c", text: "The trial is automatically abandoned" },
      { id: "d", text: "They may apply only to the High Court" }
    ],
    correctOptionId: "a",
    explanation:
      "Where a person has undergone detention up to one-half of the maximum period of imprisonment specified for the offence, they shall be released by the Court on bail — subject to the provisos in that section.",
    citation: { sourceId: "bnss", unitNumber: "479", label: "BNSS, Section 479(1)" }
  },
  {
    id: "bail-procedure-basics-3",
    articleSlug: "bail-procedure-basics",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "For a first-time offender never previously convicted, what fraction of the maximum sentence triggers release on bond?",
    options: [
      { id: "a", text: "One-tenth" },
      { id: "b", text: "One-third" },
      { id: "c", text: "One-half" },
      { id: "d", text: "Two-thirds" }
    ],
    correctOptionId: "b",
    explanation:
      "The first proviso provides that a first-time offender, who has never been convicted of any offence in the past, shall be released on bond after detention extending up to one-third of the maximum period of imprisonment specified for the offence.",
    citation: { sourceId: "bnss", unitNumber: "479", label: "BNSS, Section 479(1), proviso" }
  },
  {
    id: "bonds-and-sureties-1",
    articleSlug: "bonds-and-sureties",
    difficulty: "easy",
    format: "true-false",
    prompt: "The amount of a bail bond may be set as high as the court thinks will deter the accused.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "a",
    explanation:
      "The amount of every bond shall be fixed with due regard to the circumstances of the case and shall not be excessive, and the High Court or Court of Session may direct that it be reduced.",
    citation: { sourceId: "bnss", unitNumber: "484", label: "BNSS, Section 484" }
  },
  {
    id: "bonds-and-sureties-2",
    articleSlug: "bonds-and-sureties",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "What must a person standing surety declare before the Court?",
    options: [
      { id: "a", text: "Their annual income and tax records" },
      { id: "b", text: "Their relationship to the investigating officer" },
      { id: "c", text: "Their opinion on the accused's guilt" },
      { id: "d", text: "How many people they have stood surety for, including the accused" }
    ],
    correctOptionId: "d",
    explanation:
      "Every person standing surety must make a declaration before the Court as to the number of persons to whom they have stood surety, including the accused, giving all the relevant particulars.",
    citation: { sourceId: "bnss", unitNumber: "486", label: "BNSS, Section 486" }
  },
  {
    id: "bonds-and-sureties-3",
    articleSlug: "bonds-and-sureties",
    difficulty: "hard",
    format: "scenario",
    scenario:
      "A bond for appearance is proved to a Court to have been forfeited, and the person bound does not pay the penalty or show cause.",
    prompt: "What may the Court do?",
    options: [
      { id: "a", text: "Recover the penalty as if it were a fine imposed by the Court" },
      { id: "b", text: "Nothing further, as a bond is only a formality" },
      { id: "c", text: "Convict the surety of the original offence" },
      { id: "d", text: "Cancel the case against the accused" }
    ],
    correctOptionId: "a",
    explanation:
      "The Court records the grounds of proof and calls on the person bound to pay the penalty or show cause; if sufficient cause is not shown and the penalty is not paid, the Court may recover it as if it were a fine it had imposed.",
    citation: { sourceId: "bnss", unitNumber: "491", label: "BNSS, Section 491" }
  }
];
