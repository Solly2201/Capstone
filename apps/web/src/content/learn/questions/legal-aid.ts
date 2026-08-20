import type { QuizQuestion } from "../types";

export const legalAidQuestions: QuizQuestion[] = [
  {
    id: "free-legal-aid-1",
    articleSlug: "free-legal-aid",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Which of these categories is entitled to free legal services under section 12?",
    options: [
      { id: "a", text: "Any person who asks, without any criterion" },
      { id: "b", text: "Only persons above sixty years of age" },
      { id: "c", text: "A woman or a child" },
      { id: "d", text: "Only persons facing criminal charges" }
    ],
    correctOptionId: "c",
    explanation:
      "Section 12 lists the entitled categories, which include members of a Scheduled Caste or Scheduled Tribe, victims of trafficking or begar, a woman or a child, a person with disability, victims of mass disaster or similar want, industrial workmen, persons in custody, and persons below the prescribed income.",
    citation: { sourceId: "lsa", unitNumber: "12", label: "Legal Services Authorities Act, Section 12" }
  },
  {
    id: "free-legal-aid-2",
    articleSlug: "free-legal-aid",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Besides falling in a listed category, what must the Authority be satisfied of before providing legal services?",
    options: [
      { id: "a", text: "That the person is likely to win" },
      { id: "b", text: "That no other lawyer is available" },
      { id: "c", text: "That the case involves a constitutional question" },
      { id: "d", text: "That the person has a prima facie case to prosecute or defend" }
    ],
    correctOptionId: "d",
    explanation:
      "Section 13(1) makes entitlement subject to the concerned Authority being satisfied that the person has a prima facie case to prosecute or to defend.",
    citation: { sourceId: "lsa", unitNumber: "13", label: "Legal Services Authorities Act, Section 13(1)" }
  },
  {
    id: "free-legal-aid-3",
    articleSlug: "free-legal-aid",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "How may a person establish their income for the purpose of legal-aid eligibility?",
    options: [
      { id: "a", text: "By an affidavit as to income, unless the Authority disbelieves it" },
      { id: "b", text: "Only by producing income-tax returns for three years" },
      { id: "c", text: "Only by a certificate from an employer" },
      { id: "d", text: "Only by a court-ordered means assessment" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 13(2) provides that an affidavit made by a person as to their income may be regarded as sufficient to establish eligibility, unless the concerned Authority has reason to disbelieve it.",
    citation: { sourceId: "lsa", unitNumber: "13", label: "Legal Services Authorities Act, Section 13(2)" }
  },
  {
    id: "legal-services-authorities-1",
    articleSlug: "legal-services-authorities",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Who chairs a District Legal Services Authority?",
    options: [
      { id: "a", text: "The District Collector" },
      { id: "b", text: "The District Judge" },
      { id: "c", text: "The Superintendent of Police" },
      { id: "d", text: "A senior advocate elected by the district Bar" }
    ],
    correctOptionId: "b",
    explanation:
      "Section 9(2) provides that a District Authority consists of the District Judge as its Chairman, together with other members nominated by the State Government in consultation with the Chief Justice of the High Court.",
    citation: { sourceId: "lsa", unitNumber: "9", label: "Legal Services Authorities Act, Section 9(2)" }
  },
  {
    id: "legal-services-authorities-2",
    articleSlug: "legal-services-authorities",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Which of these is a function of the Central Authority under section 4?",
    options: [
      { id: "a", text: "Trying cases referred to it by the High Courts" },
      { id: "b", text: "Appointing judges to the District Judiciary" },
      { id: "c", text: "Organising legal aid camps, especially in rural areas" },
      { id: "d", text: "Setting court fees for civil suits" }
    ],
    correctOptionId: "c",
    explanation:
      "Section 4(e) makes organising legal aid camps — especially in rural areas, slums and labour colonies, to educate weaker sections and encourage settlement through Lok Adalats — a function of the Central Authority.",
    citation: { sourceId: "lsa", unitNumber: "4", label: "Legal Services Authorities Act, Section 4(e)" }
  },
  {
    id: "legal-services-authorities-3",
    articleSlug: "legal-services-authorities",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "Who chairs the Supreme Court Legal Services Committee?",
    options: [
      { id: "a", text: "The Attorney-General of India" },
      { id: "b", text: "The Chairman of the Bar Council of India" },
      { id: "c", text: "The Union Law Secretary" },
      { id: "d", text: "A sitting Judge of the Supreme Court" }
    ],
    correctOptionId: "d",
    explanation:
      "Section 3A(2) provides that the Committee consists of a sitting Judge of the Supreme Court as Chairman, with other members nominated by the Chief Justice of India.",
    citation: { sourceId: "lsa", unitNumber: "3A", label: "Legal Services Authorities Act, Section 3A(2)" }
  },
  {
    id: "lok-adalats-1",
    articleSlug: "lok-adalats",
    difficulty: "easy",
    format: "true-false",
    prompt: "An appeal lies to a court against an award of a Lok Adalat.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 21(2) provides that every award made by a Lok Adalat is final and binding on all the parties to the dispute, and no appeal lies to any court against the award.",
    citation: { sourceId: "lsa", unitNumber: "21", label: "Legal Services Authorities Act, Section 21(2)" }
  },
  {
    id: "lok-adalats-2",
    articleSlug: "lok-adalats",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "What happens to the court fee already paid when a referred case is settled by a Lok Adalat?",
    options: [
      { id: "a", text: "It is forfeited to the State" },
      { id: "b", text: "It is refunded" },
      { id: "c", text: "It is doubled as a settlement charge" },
      { id: "d", text: "It is transferred to the legal aid fund" }
    ],
    correctOptionId: "b",
    explanation:
      "Section 21(1) provides that where a compromise or settlement is arrived at by a Lok Adalat in a case referred to it, the court fee paid in that case shall be refunded.",
    citation: { sourceId: "lsa", unitNumber: "21", label: "Legal Services Authorities Act, Section 21(1)" }
  },
  {
    id: "lok-adalats-3",
    articleSlug: "lok-adalats",
    difficulty: "hard",
    format: "scenario",
    scenario:
      "A case is referred to a Lok Adalat by a court, but the parties cannot reach any compromise.",
    prompt: "What happens next?",
    options: [
      { id: "a", text: "The case is dismissed, because the parties failed to reach a settlement" },
      { id: "b", text: "The Lok Adalat goes on to decide the case on its merits instead" },
      { id: "c", text: "The record goes back to the court, which resumes where it stopped" },
      { id: "d", text: "The parties must start again by filing a fresh suit in a civil court" }
    ],
    correctOptionId: "c",
    explanation:
      "Section 20(5) and (7) provide that where no award is made because no compromise could be reached, the record is returned to the referring court, which then deals with the case from the stage reached before the reference.",
    citation: { sourceId: "lsa", unitNumber: "20", label: "Legal Services Authorities Act, Section 20(5) and (7)" }
  },
  {
    id: "permanent-lok-adalats-1",
    articleSlug: "permanent-lok-adalats",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Which of these is a “public utility service” for the purposes of a Permanent Lok Adalat?",
    options: [
      { id: "a", text: "A private tuition centre" },
      { id: "b", text: "A retail clothing shop" },
      { id: "c", text: "A construction contractor" },
      { id: "d", text: "Insurance service" }
    ],
    correctOptionId: "d",
    explanation:
      "Section 22A(b) lists transport, postal, telegraph or telephone service, supply of power, light or water, public conservancy or sanitation, service in a hospital or dispensary, and insurance service — plus any service the Government notifies.",
    citation: { sourceId: "lsa", unitNumber: "22A", label: "Legal Services Authorities Act, Section 22A(b)" }
  },
  {
    id: "permanent-lok-adalats-2",
    articleSlug: "permanent-lok-adalats",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "What is the effect of applying to a Permanent Lok Adalat?",
    options: [
      { id: "a", text: "No party may then go to a court on the same dispute" },
      { id: "b", text: "Any pending court case continues in parallel" },
      { id: "c", text: "The other party must pay costs immediately" },
      { id: "d", text: "The dispute is automatically decided in the applicant's favour" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 22C(2) provides that after an application is made, no party to that application shall invoke the jurisdiction of any court in the same dispute.",
    citation: { sourceId: "lsa", unitNumber: "22C", label: "Legal Services Authorities Act, Section 22C(2)" }
  },
  {
    id: "permanent-lok-adalats-3",
    articleSlug: "permanent-lok-adalats",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "Which of these limits a Permanent Lok Adalat's jurisdiction?",
    options: [
      { id: "a", text: "It cannot hear a matter involving more than two parties" },
      { id: "b", text: "It cannot hear a dispute over property worth more than ten lakh" },
      { id: "c", text: "It cannot hear a matter older than one year" },
      { id: "d", text: "It cannot hear a matter where either party has a lawyer" }
    ],
    correctOptionId: "b",
    explanation:
      "The provisos to section 22C(1) exclude matters relating to an offence not compoundable under any law, and matters where the value of the property in dispute exceeds ten lakh rupees — a figure the Central Government may raise by notification.",
    citation: { sourceId: "lsa", unitNumber: "22C", label: "Legal Services Authorities Act, Section 22C(1), provisos" }
  }
];
