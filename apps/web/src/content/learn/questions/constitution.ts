import type { QuizQuestion } from "../types";

export const constitutionQuestions: QuizQuestion[] = [
  {
    id: "what-are-fundamental-rights-1",
    articleSlug: "what-are-fundamental-rights",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Which Part of the Constitution contains the Fundamental Rights?",
    options: [
      { id: "a", text: "Part II" },
      { id: "b", text: "Part III" },
      { id: "c", text: "Part IV" },
      { id: "d", text: "Part IVA" }
    ],
    correctOptionId: "b",
    explanation:
      "Fundamental Rights are the guarantees written into Part III. Part IV holds the Directive Principles and Part IVA the Fundamental Duties.",
    citation: { sourceId: "constitution", unitNumber: "12", label: "Constitution, Article 12" }
  },
  {
    id: "what-are-fundamental-rights-2",
    articleSlug: "what-are-fundamental-rights",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "A State passes a law that takes away a right guaranteed by Part III. What does the Constitution say about that law?",
    options: [
      { id: "a", text: "It stands until Parliament repeals it" },
      { id: "b", text: "It applies only to non-citizens" },
      { id: "c", text: "It is void to the extent of the contravention" },
      { id: "d", text: "It must first be approved by the President" }
    ],
    correctOptionId: "c",
    explanation:
      "The State may not make a law that takes away or abridges Part III rights, and such a law is void to the extent of the contravention.",
    citation: { sourceId: "constitution", unitNumber: "13", label: "Constitution, Article 13" }
  },
  {
    id: "what-are-fundamental-rights-3",
    articleSlug: "what-are-fundamental-rights",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "In Part III, the word “law” in Article 13 is defined widely. Which of these is NOT included in that definition?",
    options: [
      { id: "a", text: "An Ordinance" },
      { id: "b", text: "A bye-law or regulation" },
      { id: "c", text: "A custom or usage having the force of law" },
      { id: "d", text: "A private contract between two companies" }
    ],
    correctOptionId: "d",
    explanation:
      "Article 13 defines law to include an Ordinance, order, bye-law, rule, regulation, notification, custom or usage having the force of law. Part III binds the State, not private contracting parties.",
    citation: { sourceId: "constitution", unitNumber: "13", label: "Constitution, Article 13" }
  },
  {
    id: "right-to-equality-1",
    articleSlug: "right-to-equality",
    difficulty: "easy",
    format: "true-false",
    prompt: "Article 14's guarantee of equality before the law applies only to citizens of India.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "a",
    explanation:
      "Article 14 says the State shall not deny to any person equality before the law. The word is “person”, not “citizen”, so it is not limited to citizens.",
    citation: { sourceId: "constitution", unitNumber: "14", label: "Constitution, Article 14" }
  },
  {
    id: "right-to-equality-2",
    articleSlug: "right-to-equality",
    difficulty: "medium",
    format: "scenario",
    scenario:
      "A State government makes a scheme reserving certain benefits for women and children only.",
    prompt: "Does Article 15 permit this kind of distinction?",
    options: [
      { id: "a", text: "No — Article 15 forbids every distinction based on sex" },
      { id: "b", text: "Yes, Article 15 permits special provision for women and children" },
      { id: "c", text: "Only if Parliament, not a State, makes the scheme" },
      { id: "d", text: "Only where the beneficiaries are also citizens by birth" }
    ],
    correctOptionId: "b",
    explanation:
      "Equality under Article 15 does not forbid every distinction. The Constitution expressly permits the State to make special provision for women and children.",
    citation: { sourceId: "constitution", unitNumber: "15", label: "Constitution, Article 15(3)-(5)" }
  },
  {
    id: "right-to-equality-3",
    articleSlug: "right-to-equality",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "Which article abolishes untouchability and makes enforcing any disability arising out of it an offence?",
    options: [
      { id: "a", text: "Article 15" },
      { id: "b", text: "Article 16" },
      { id: "c", text: "Article 17" },
      { id: "d", text: "Article 18" }
    ],
    correctOptionId: "c",
    explanation:
      "Article 17 abolishes untouchability, forbids its practice in any form, and makes enforcement of any disability arising out of it an offence punishable in accordance with law. Article 18 abolishes titles.",
    citation: { sourceId: "constitution", unitNumber: "16", label: "Constitution, Article 17" }
  },
  {
    id: "right-to-freedom-1",
    articleSlug: "right-to-freedom",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Which of these freedoms is guaranteed to citizens by Article 19(1)?",
    options: [
      { id: "a", text: "To be granted bail in every case" },
      { id: "b", text: "To be tried only by a jury" },
      { id: "c", text: "To hold any public office of their choosing" },
      { id: "d", text: "To assemble peaceably and without arms" }
    ],
    correctOptionId: "d",
    explanation:
      "Article 19(1) guarantees, among others, the right to assemble peaceably and without arms, alongside speech and expression, association, movement, residence and profession.",
    citation: { sourceId: "constitution", unitNumber: "19", label: "Constitution, Article 19(1)" }
  },
  {
    id: "right-to-freedom-2",
    articleSlug: "right-to-freedom",
    difficulty: "medium",
    format: "true-false",
    prompt: "The freedoms in Article 19(1) are absolute and cannot be restricted by the State.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "a",
    explanation:
      "None of these freedoms is unlimited. The Constitution itself allows the State to impose reasonable restrictions, and each freedom has its own list of permitted grounds in the clauses that follow.",
    citation: { sourceId: "constitution", unitNumber: "19", label: "Constitution, Article 19(2)-(6)" }
  },
  {
    id: "right-to-freedom-3",
    articleSlug: "right-to-freedom",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "Which of these is a permitted ground for restricting freedom of speech under Article 19(2)?",
    options: [
      { id: "a", text: "That the speech is unpopular with a majority" },
      { id: "b", text: "Public order, decency or morality" },
      { id: "c", text: "That the speaker holds no public office" },
      { id: "d", text: "That the speech criticises a government policy" }
    ],
    correctOptionId: "b",
    explanation:
      "Article 19(2) lists the permitted grounds, which include the sovereignty and integrity of India, the security of the State, friendly relations with foreign States, public order, decency or morality, contempt of court, defamation and incitement to an offence.",
    citation: { sourceId: "constitution", unitNumber: "19", label: "Constitution, Article 19(2)" }
  },
  {
    id: "right-against-exploitation-1",
    articleSlug: "right-against-exploitation",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Article 23 prohibits which of the following?",
    options: [
      { id: "a", text: "All forms of paid employment by the State" },
      { id: "b", text: "Compulsory military service in any circumstances" },
      { id: "c", text: "Traffic in human beings and begar" },
      { id: "d", text: "Employment of anyone under twenty-one years of age" }
    ],
    correctOptionId: "c",
    explanation:
      "Article 23 prohibits traffic in human beings, begar and other similar forms of forced labour, and makes contravention an offence punishable in accordance with law.",
    citation: { sourceId: "constitution", unitNumber: "23", label: "Constitution, Article 23" }
  },
  {
    id: "right-against-exploitation-2",
    articleSlug: "right-against-exploitation",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Under Article 24, below what age may a child not be employed in a factory, mine or other hazardous employment?",
    options: [
      { id: "a", text: "Twelve years" },
      { id: "b", text: "Sixteen years" },
      { id: "c", text: "Eighteen years" },
      { id: "d", text: "Fourteen years" }
    ],
    correctOptionId: "d",
    explanation:
      "Article 24 provides that no child below the age of fourteen years shall be employed to work in any factory or mine or engaged in any other hazardous employment.",
    citation: { sourceId: "constitution", unitNumber: "24", label: "Constitution, Article 24" }
  },
  {
    id: "right-against-exploitation-3",
    articleSlug: "right-against-exploitation",
    difficulty: "hard",
    format: "true-false",
    prompt: "Article 23 prevents the State from imposing compulsory service for public purposes in any circumstances.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "a",
    explanation:
      "Article 23 expressly allows the State to impose compulsory service for public purposes, provided it makes no discrimination on grounds only of religion, race, caste or class.",
    citation: { sourceId: "constitution", unitNumber: "23", label: "Constitution, Article 23(2)" }
  },
  {
    id: "freedom-of-religion-1",
    articleSlug: "freedom-of-religion",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "What does Article 25 guarantee to all persons?",
    options: [
      { id: "a", text: "A right to State funding for religious institutions" },
      { id: "b", text: "Freedom of conscience, and to profess and practise religion" },
      { id: "c", text: "A right to be exempt from all general laws" },
      { id: "d", text: "A right to have religious disputes decided by a religious court" }
    ],
    correctOptionId: "b",
    explanation:
      "Article 25 guarantees to all persons freedom of conscience and the right freely to profess, practise and propagate religion, subject to public order, morality and health and to the other provisions of Part III.",
    citation: { sourceId: "constitution", unitNumber: "25", label: "Constitution, Article 25(1)" }
  },
  {
    id: "freedom-of-religion-2",
    articleSlug: "freedom-of-religion",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Article 27 says no person shall be compelled to pay taxes for which purpose?",
    options: [
      { id: "a", text: "The upkeep of public roads" },
      { id: "b", text: "The salaries of judges" },
      { id: "c", text: "Promoting or maintaining a particular religion" },
      { id: "d", text: "The running of State schools" }
    ],
    correctOptionId: "c",
    explanation:
      "Article 27 provides that no person shall be compelled to pay any taxes the proceeds of which are specifically appropriated for the promotion or maintenance of any particular religion or religious denomination.",
    citation: { sourceId: "constitution", unitNumber: "27", label: "Constitution, Article 27" }
  },
  {
    id: "freedom-of-religion-3",
    articleSlug: "freedom-of-religion",
    difficulty: "hard",
    format: "scenario",
    scenario:
      "A school is wholly maintained out of State funds and proposes to hold compulsory religious instruction.",
    prompt: "What does Article 28 say about this?",
    options: [
      { id: "a", text: "It is permitted if a majority of parents agree" },
      { id: "b", text: "It is permitted for one religion only" },
      { id: "c", text: "It is permitted if the instruction is held outside school hours" },
      { id: "d", text: "No religious instruction shall be provided in such an institution" }
    ],
    correctOptionId: "d",
    explanation:
      "Article 28 provides that no religious instruction shall be provided in any educational institution wholly maintained out of State funds, with a narrow exception for institutions administered under an endowment or trust requiring it.",
    citation: { sourceId: "constitution", unitNumber: "28", label: "Constitution, Article 28" }
  },
  {
    id: "cultural-and-educational-rights-1",
    articleSlug: "cultural-and-educational-rights",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Article 29 protects the right of a section of citizens to conserve what?",
    options: [
      { id: "a", text: "Their distinct language, script or culture" },
      { id: "b", text: "Their property holdings" },
      { id: "c", text: "Their voting arrangements" },
      { id: "d", text: "Their existing employment" }
    ],
    correctOptionId: "a",
    explanation:
      "Article 29 gives any section of citizens having a distinct language, script or culture of its own the right to conserve it.",
    citation: { sourceId: "constitution", unitNumber: "29", label: "Constitution, Article 29(1)" }
  },
  {
    id: "cultural-and-educational-rights-2",
    articleSlug: "cultural-and-educational-rights",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Article 30 gives minorities, whether based on religion or language, which right?",
    options: [
      { id: "a", text: "To be exempt from State education policy entirely" },
      { id: "b", text: "To establish and administer educational institutions of their choice" },
      { id: "c", text: "To reserve seats in every State university" },
      { id: "d", text: "To have their own separate school boards by right" }
    ],
    correctOptionId: "b",
    explanation:
      "Article 30 gives all minorities, whether based on religion or language, the right to establish and administer educational institutions of their choice.",
    citation: { sourceId: "constitution", unitNumber: "30", label: "Constitution, Article 30(1)" }
  },
  {
    id: "cultural-and-educational-rights-3",
    articleSlug: "cultural-and-educational-rights",
    difficulty: "hard",
    format: "true-false",
    prompt: "Under Article 29(2), a State-maintained or State-aided institution may deny admission on the ground of religion, race, caste or language.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "a",
    explanation:
      "Article 29(2) provides that no citizen shall be denied admission into any educational institution maintained by the State or receiving aid out of State funds on grounds only of religion, race, caste, language or any of them.",
    citation: { sourceId: "constitution", unitNumber: "29", label: "Constitution, Article 29(2)" }
  },
  {
    id: "constitutional-remedies-1",
    articleSlug: "constitutional-remedies",
    difficulty: "easy",
    format: "true-false",
    prompt: "The right to move the Supreme Court for the enforcement of Part III rights is itself a fundamental right.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "b",
    explanation:
      "Article 32(1) guarantees the right to move the Supreme Court by appropriate proceedings for the enforcement of Part III rights, and that guarantee sits inside Part III itself.",
    citation: { sourceId: "constitution", unitNumber: "32", label: "Constitution, Article 32(1)" }
  },
  {
    id: "constitutional-remedies-2",
    articleSlug: "constitutional-remedies",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Which of these is one of the five writs named in Article 32(2)?",
    options: [
      { id: "a", text: "Quo warranto" },
      { id: "b", text: "Subpoena" },
      { id: "c", text: "Injunction" },
      { id: "d", text: "Attachment" }
    ],
    correctOptionId: "a",
    explanation:
      "Article 32(2) names habeas corpus, mandamus, prohibition, quo warranto and certiorari as the writs the Supreme Court may issue for the enforcement of Part III rights.",
    citation: { sourceId: "constitution", unitNumber: "32", label: "Constitution, Article 32(2)" }
  },
  {
    id: "constitutional-remedies-3",
    articleSlug: "constitutional-remedies",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "What does Article 32(4) say about the right it guarantees?",
    options: [
      { id: "a", text: "It may be waived by the person entitled to it" },
      { id: "b", text: "It cannot be suspended except as the Constitution provides" },
      { id: "c", text: "It applies only during a proclaimed Emergency" },
      { id: "d", text: "It may be limited by any law made by Parliament" }
    ],
    correctOptionId: "b",
    explanation:
      "Article 32(4) provides that the right guaranteed by that article shall not be suspended except as otherwise provided for by the Constitution itself.",
    citation: { sourceId: "constitution", unitNumber: "32", label: "Constitution, Article 32(4)" }
  },
  {
    id: "fundamental-duties-1",
    articleSlug: "fundamental-duties",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Where in the Constitution are the Fundamental Duties set out?",
    options: [
      { id: "a", text: "Article 21A" },
      { id: "b", text: "Article 32" },
      { id: "c", text: "Article 51A" },
      { id: "d", text: "Article 226" }
    ],
    correctOptionId: "c",
    explanation:
      "The Fundamental Duties of every citizen are listed in Article 51A, which forms Part IVA of the Constitution.",
    citation: { sourceId: "constitution", unitNumber: "51A", label: "Constitution, Article 51A" }
  },
  {
    id: "fundamental-duties-2",
    articleSlug: "fundamental-duties",
    difficulty: "medium",
    format: "true-false",
    prompt: "A Fundamental Duty under Article 51A is directly enforceable against a citizen by a writ petition.",
    options: [
      { id: "a", text: "True" },
      { id: "b", text: "False" }
    ],
    correctOptionId: "b",
    explanation:
      "Article 51A states duties of citizens; unlike Part III rights, it does not create a remedy enforceable by writ. Its practical force comes through laws made in pursuit of those duties.",
    citation: { sourceId: "constitution", unitNumber: "51A", label: "Constitution, Article 51A" }
  },
  {
    id: "fundamental-duties-3",
    articleSlug: "fundamental-duties",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "Which of these is listed as a Fundamental Duty in Article 51A?",
    options: [
      { id: "a", text: "To protect and improve the natural environment" },
      { id: "b", text: "To vote in every general election" },
      { id: "c", text: "To serve in the armed forces for a fixed period" },
      { id: "d", text: "To contribute a share of income to public funds" }
    ],
    correctOptionId: "a",
    explanation:
      "Article 51A includes the duty to protect and improve the natural environment including forests, lakes, rivers and wildlife, and to have compassion for living creatures.",
    citation: { sourceId: "constitution", unitNumber: "51A", label: "Constitution, Article 51A(g)" }
  },
  {
    id: "directive-principles-1",
    articleSlug: "directive-principles",
    difficulty: "easy",
    format: "true-false",
    prompt: "The Directive Principles in Part IV can be enforced directly by a court.",
    options: [
      { id: "a", text: "True" },
      { id: "b", text: "False" }
    ],
    correctOptionId: "b",
    explanation:
      "Article 37 says the provisions of Part IV shall not be enforceable by any court, though the principles are nevertheless fundamental in the governance of the country and it is the State's duty to apply them in making laws.",
    citation: { sourceId: "constitution", unitNumber: "37", label: "Constitution, Article 37" }
  },
  {
    id: "directive-principles-2",
    articleSlug: "directive-principles",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Which Directive Principle is the constitutional basis for India's free legal aid system?",
    options: [
      { id: "a", text: "Article 38" },
      { id: "b", text: "Article 44" },
      { id: "c", text: "Article 39A" },
      { id: "d", text: "Article 50" }
    ],
    correctOptionId: "c",
    explanation:
      "Article 39A directs the State to secure that the legal system promotes justice on a basis of equal opportunity and, in particular, to provide free legal aid so that justice is not denied by reason of economic or other disabilities.",
    citation: { sourceId: "constitution", unitNumber: "39", label: "Constitution, Article 39A" }
  },
  {
    id: "directive-principles-3",
    articleSlug: "directive-principles",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "Which of these is a policy direction expressly listed in Article 39?",
    options: [
      { id: "a", text: "A uniform civil code throughout India" },
      { id: "b", text: "Separation of the judiciary from the executive" },
      { id: "c", text: "Promotion of international peace and security" },
      { id: "d", text: "Equal pay for equal work for both men and women" }
    ],
    correctOptionId: "d",
    explanation:
      "Equal pay for equal work for both men and women is in Article 39(d). A uniform civil code is Article 44, separation of judiciary from executive is Article 50, and international peace is Article 51.",
    citation: { sourceId: "constitution", unitNumber: "39", label: "Constitution, Article 39" }
  },
  {
    id: "writ-remedies-1",
    articleSlug: "writ-remedies",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Which court's writ power is guaranteed by Article 32?",
    options: [
      { id: "a", text: "The Supreme Court" },
      { id: "b", text: "Every District Court" },
      { id: "c", text: "Every High Court" },
      { id: "d", text: "Every Court of Session" }
    ],
    correctOptionId: "a",
    explanation:
      "Article 32 guarantees the right to move the Supreme Court, and gives the Supreme Court power to issue directions, orders or writs for the enforcement of Part III rights.",
    citation: { sourceId: "constitution", unitNumber: "32", label: "Constitution, Article 32" }
  },
  {
    id: "writ-remedies-2",
    articleSlug: "writ-remedies",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "How does a High Court's writ jurisdiction under Article 226 differ from the Supreme Court's under Article 32?",
    options: [
      { id: "a", text: "It is confined to habeas corpus alone" },
      { id: "b", text: "It extends beyond Part III rights, to any other purpose" },
      { id: "c", text: "It requires the Supreme Court's prior permission" },
      { id: "d", text: "It is available only in criminal matters" }
    ],
    correctOptionId: "b",
    explanation:
      "Article 226 lets a High Court issue the same writs for the enforcement of Part III rights and for any other purpose. Article 32 is confined to fundamental rights.",
    citation: { sourceId: "constitution", unitNumber: "225", label: "Constitution, Article 226(1)" }
  },
  {
    id: "writ-remedies-3",
    articleSlug: "writ-remedies",
    difficulty: "hard",
    format: "scenario",
    scenario:
      "An authority with its seat in one State makes a decision, and the cause of action arises partly within the territory of a different High Court.",
    prompt: "Can that second High Court exercise writ jurisdiction over the authority?",
    options: [
      { id: "a", text: "No — only the High Court where the authority is seated may act" },
      { id: "b", text: "Only with a transfer order from the Supreme Court" },
      { id: "c", text: "Yes, where the cause of action arises within its territories" },
      { id: "d", text: "Only if the authority consents to its jurisdiction" }
    ],
    correctOptionId: "c",
    explanation:
      "Article 226(2) allows a High Court to exercise the writ power where the cause of action arises wholly or in part within its territories, notwithstanding that the seat of the Government or authority is not within them.",
    citation: { sourceId: "constitution", unitNumber: "225", label: "Constitution, Article 226(2)" }
  }
];
