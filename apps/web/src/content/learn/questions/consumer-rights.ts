import type { QuizQuestion } from "../types";

export const consumerRightsQuestions: QuizQuestion[] = [
  {
    id: "consumer-rights-basics-1",
    articleSlug: "consumer-rights-basics",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Who is excluded from the definition of a consumer?",
    options: [
      { id: "a", text: "A person who pays for goods in instalments" },
      { id: "b", text: "A person who uses goods bought by someone else, with their approval" },
      { id: "c", text: "A person who hires a service rather than buying goods" },
      { id: "d", text: "A person who buys goods for resale or for a commercial purpose" }
    ],
    correctOptionId: "d",
    explanation:
      "The definition covers buyers and users of goods and services for consideration, including under deferred payment, but excludes a person who obtains goods for resale or for any commercial purpose.",
    citation: { sourceId: "cpa2019", unitNumber: "2", label: "Consumer Protection Act, Section 2(7)" }
  },
  {
    id: "consumer-rights-basics-2",
    articleSlug: "consumer-rights-basics",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "What is the difference between a “defect” and a “deficiency” under the Act?",
    options: [
      { id: "a", text: "A defect relates to goods; a deficiency to a service" },
      { id: "b", text: "A defect is minor; a deficiency is serious" },
      { id: "c", text: "A defect is intentional; a deficiency is accidental" },
      { id: "d", text: "A defect is proved by a laboratory; a deficiency is presumed" }
    ],
    correctOptionId: "a",
    explanation:
      "A defect is a fault, imperfection or shortcoming in the quality, quantity, potency, purity or standard of goods. A deficiency is a fault, imperfection, shortcoming or inadequacy in the quality, nature and manner of performance of a service.",
    citation: { sourceId: "cpa2019", unitNumber: "2", label: "Consumer Protection Act, Sections 2(10)-(11)" }
  },
  {
    id: "consumer-rights-basics-3",
    articleSlug: "consumer-rights-basics",
    difficulty: "hard",
    format: "scenario",
    scenario:
      "A contract requires a consumer to pay a penalty on breach that is wholly disproportionate to the loss actually caused.",
    prompt: "What does the Consumer Protection Act call such a term?",
    options: [
      { id: "a", text: "An unfair trade practice" },
      { id: "b", text: "An unfair contract" },
      { id: "c", text: "A restrictive trade practice" },
      { id: "d", text: "A product liability action" }
    ],
    correctOptionId: "b",
    explanation:
      "An unfair contract is one whose terms cause a significant change in the consumer's rights, and the Act gives imposing a penalty wholly disproportionate to the loss as one of its examples.",
    citation: { sourceId: "cpa2019", unitNumber: "2", label: "Consumer Protection Act, Section 2(46)" }
  },
  {
    id: "where-to-file-a-consumer-complaint-1",
    articleSlug: "where-to-file-a-consumer-complaint",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Up to what value of consideration does the District Commission entertain complaints?",
    options: [
      { id: "a", text: "Ten lakh rupees" },
      { id: "b", text: "Fifty lakh rupees" },
      { id: "c", text: "One crore rupees" },
      { id: "d", text: "Ten crore rupees" }
    ],
    correctOptionId: "c",
    explanation:
      "The District Commission entertains complaints where the value of the goods or services paid as consideration does not exceed one crore rupees, unless the Central Government prescribes another value.",
    citation: { sourceId: "cpa2019", unitNumber: "34", label: "Consumer Protection Act, Section 34(1)" }
  },
  {
    id: "where-to-file-a-consumer-complaint-2",
    articleSlug: "where-to-file-a-consumer-complaint",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Within what period must a consumer complaint ordinarily be filed?",
    options: [
      { id: "a", text: "Thirty days from the cause of action" },
      { id: "b", text: "Six months from the cause of action" },
      { id: "c", text: "There is no limitation period" },
      { id: "d", text: "Two years from the cause of action" }
    ],
    correctOptionId: "d",
    explanation:
      "A Commission shall not admit a complaint unless it is filed within two years from the date on which the cause of action arose, though delay may be condoned for sufficient cause with reasons recorded.",
    citation: { sourceId: "cpa2019", unitNumber: "69", label: "Consumer Protection Act, Section 69" }
  },
  {
    id: "where-to-file-a-consumer-complaint-3",
    articleSlug: "where-to-file-a-consumer-complaint",
    difficulty: "hard",
    format: "scenario",
    scenario:
      "A consumer lives in one district and the seller carries on business in another. The purchase was made online.",
    prompt: "Which of these is a valid place to institute the complaint?",
    options: [
      { id: "a", text: "Where the complainant resides or personally works for gain" },
      { id: "b", text: "Only where the seller carries on business" },
      { id: "c", text: "Only where the goods were manufactured" },
      { id: "d", text: "Only the National Commission, for any online purchase" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 34(2) allows a complaint to be instituted where the opposite party resides or carries on business, where the cause of action arises wholly or in part, or where the complainant resides or personally works for gain.",
    citation: { sourceId: "cpa2019", unitNumber: "34", label: "Consumer Protection Act, Section 34(2)" }
  },
  {
    id: "how-a-consumer-case-proceeds-1",
    articleSlug: "how-a-consumer-case-proceeds",
    difficulty: "easy",
    format: "true-false",
    prompt: "A consumer complaint may be filed electronically.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "b",
    explanation:
      "A proviso to section 35(1) expressly allows a complaint under that sub-section to be filed electronically in the prescribed manner.",
    citation: { sourceId: "cpa2019", unitNumber: "35", label: "Consumer Protection Act, Section 35(1)" }
  },
  {
    id: "how-a-consumer-case-proceeds-2",
    articleSlug: "how-a-consumer-case-proceeds",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "What happens if a District Commission does not decide the admissibility of a complaint within twenty-one days?",
    options: [
      { id: "a", text: "The complaint lapses" },
      { id: "b", text: "The complaint is transferred to the State Commission" },
      { id: "c", text: "The complaint is deemed to have been admitted" },
      { id: "d", text: "The complainant must file again" }
    ],
    correctOptionId: "c",
    explanation:
      "Admissibility is ordinarily to be decided within twenty-one days of filing, and where the Commission does not decide within that period the complaint is deemed to have been admitted.",
    citation: { sourceId: "cpa2019", unitNumber: "36", label: "Consumer Protection Act, Section 36(3)" }
  },
  {
    id: "how-a-consumer-case-proceeds-3",
    articleSlug: "how-a-consumer-case-proceeds",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "A trader ordered to pay an amount wants to appeal to the State Commission. What must they do first?",
    options: [
      { id: "a", text: "Obtain the complainant's written consent" },
      { id: "b", text: "Pay the amount in full" },
      { id: "c", text: "Wait ninety days from the order" },
      { id: "d", text: "Deposit fifty per cent of that amount" }
    ],
    correctOptionId: "d",
    explanation:
      "No appeal by a person required to pay an amount under a District Commission order is entertained unless the appellant has deposited fifty per cent of that amount in the prescribed manner.",
    citation: { sourceId: "cpa2019", unitNumber: "41", label: "Consumer Protection Act, Section 41" }
  },
  {
    id: "consumer-mediation-1",
    articleSlug: "consumer-mediation",
    difficulty: "easy",
    format: "true-false",
    prompt: "A Commission can send a consumer dispute to mediation without the parties' consent.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "a",
    explanation:
      "The Commission directs the parties to give written consent within five days, and refers the matter only where the parties agree and give that consent in writing.",
    citation: { sourceId: "cpa2019", unitNumber: "37", label: "Consumer Protection Act, Section 37" }
  },
  {
    id: "consumer-mediation-2",
    articleSlug: "consumer-mediation",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Where is consumer mediation conducted?",
    options: [
      { id: "a", text: "In the opposite party's place of business" },
      { id: "b", text: "In the mediation cell attached to that Commission" },
      { id: "c", text: "In any civil court chosen by the parties" },
      { id: "d", text: "Only by video conference" }
    ],
    correctOptionId: "b",
    explanation:
      "Mediation is held in the consumer mediation cell attached to the District, State or National Commission, as the case may be. Such cells are established by the State and Central Governments.",
    citation: { sourceId: "cpa2019", unitNumber: "79", label: "Consumer Protection Act, Sections 74 and 79" }
  },
  {
    id: "consumer-mediation-3",
    articleSlug: "consumer-mediation",
    difficulty: "hard",
    format: "scenario",
    scenario:
      "Mediation settles three of the five issues in a consumer dispute, and the mediator reports that to the Commission.",
    prompt: "What does the Commission do?",
    options: [
      { id: "a", text: "Dismisses the whole complaint" },
      { id: "b", text: "Refers the entire dispute back to mediation" },
      { id: "c", text: "Records the settled issues and continues to hear the others" },
      { id: "d", text: "Transfers the case to a civil court" }
    ],
    correctOptionId: "c",
    explanation:
      "Where a consumer dispute is settled only in part, the Commission records the settlement of the issues so settled and continues to hear the other issues involved.",
    citation: { sourceId: "cpa2019", unitNumber: "81", label: "Consumer Protection Act, Section 81(2)" }
  },
  {
    id: "product-liability-1",
    articleSlug: "product-liability",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Against whom may a product liability action be brought?",
    options: [
      { id: "a", text: "Only the manufacturer" },
      { id: "b", text: "Only the retailer who made the sale" },
      { id: "c", text: "Only a person who gave an express warranty" },
      { id: "d", text: "A manufacturer, a service provider, or a seller" }
    ],
    correctOptionId: "d",
    explanation:
      "Section 83 allows a product liability action against a product manufacturer, a product service provider or a product seller for any harm caused by a defective product.",
    citation: { sourceId: "cpa2019", unitNumber: "83", label: "Consumer Protection Act, Section 83" }
  },
  {
    id: "product-liability-2",
    articleSlug: "product-liability",
    difficulty: "medium",
    format: "true-false",
    prompt: "A manufacturer escapes liability for an express warranty if it proves it was neither negligent nor fraudulent in making it.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 84(2) states that a product manufacturer is liable in a product liability action even if it proves it was not negligent or fraudulent in making the express warranty.",
    citation: { sourceId: "cpa2019", unitNumber: "84", label: "Consumer Protection Act, Section 84(2)" }
  },
  {
    id: "product-liability-3",
    articleSlug: "product-liability",
    difficulty: "hard",
    format: "scenario",
    scenario:
      "At the time the harm occurred, the product had been modified by the user.",
    prompt: "What does the Act say about a product liability action against the seller in that situation?",
    options: [
      { id: "a", text: "The seller remains fully liable" },
      { id: "b", text: "The action cannot be brought against the product seller" },
      { id: "c", text: "Liability is shared equally with the manufacturer" },
      { id: "d", text: "The action must be brought within thirty days" }
    ],
    correctOptionId: "b",
    explanation:
      "Section 87(1) provides that a product liability action cannot be brought against the product seller if, at the time of harm, the product was misused, altered or modified.",
    citation: { sourceId: "cpa2019", unitNumber: "87", label: "Consumer Protection Act, Section 87(1)" }
  },
  {
    id: "misleading-advertisements-1",
    articleSlug: "misleading-advertisements",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "What is the Central Consumer Protection Authority's role?",
    options: [
      { id: "a", text: "To hear individual consumer complaints as a tribunal" },
      { id: "b", text: "To license all traders before they may sell" },
      { id: "c", text: "To protect and enforce the rights of consumers as a class" },
      { id: "d", text: "To fix the prices of essential goods" }
    ],
    correctOptionId: "c",
    explanation:
      "The Central Authority's duties are to protect, promote and enforce the rights of consumers as a class, prevent unfair trade practices, and ensure no false or misleading advertisement is made or published.",
    citation: { sourceId: "cpa2019", unitNumber: "18", label: "Consumer Protection Act, Section 18(1)" }
  },
  {
    id: "misleading-advertisements-2",
    articleSlug: "misleading-advertisements",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "What may the Central Authority order where an investigation shows sufficient evidence of a violation of consumer rights?",
    options: [
      { id: "a", text: "Imprisonment of the trader" },
      { id: "b", text: "Cancellation of the trader's bank accounts" },
      { id: "c", text: "Immediate closure of the business without a hearing" },
      { id: "d", text: "Recall of dangerous goods, and reimbursement to purchasers" }
    ],
    correctOptionId: "d",
    explanation:
      "Section 20 lets the Authority order the recall of dangerous, hazardous or unsafe goods or withdrawal of such services, reimbursement of prices to purchasers, and discontinuation of unfair practices — after giving the person an opportunity of being heard.",
    citation: { sourceId: "cpa2019", unitNumber: "20", label: "Consumer Protection Act, Section 20" }
  },
  {
    id: "misleading-advertisements-3",
    articleSlug: "misleading-advertisements",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "For a first false or misleading advertisement, what penalty may the Central Authority impose on a manufacturer or endorser?",
    options: [
      { id: "a", text: "Up to ten lakh rupees" },
      { id: "b", text: "Up to one lakh rupees" },
      { id: "c", text: "Up to fifty lakh rupees" },
      { id: "d", text: "Up to one crore rupees" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 21(2) allows a penalty of up to ten lakh rupees on a manufacturer or endorser, rising to up to fifty lakh rupees for every subsequent contravention.",
    citation: { sourceId: "cpa2019", unitNumber: "21", label: "Consumer Protection Act, Section 21(2)" }
  }
];
