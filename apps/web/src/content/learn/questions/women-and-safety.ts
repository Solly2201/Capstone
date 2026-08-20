import type { QuizQuestion } from "../types";

export const womenAndSafetyQuestions: QuizQuestion[] = [
  {
    id: "what-is-domestic-violence-1",
    articleSlug: "what-is-domestic-violence",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Which kinds of abuse does the statutory definition of domestic violence expressly include?",
    options: [
      { id: "a", text: "Physical abuse only" },
      { id: "b", text: "Only abuse that leaves a visible injury" },
      { id: "c", text: "Physical, sexual, verbal and emotional, and economic abuse" },
      { id: "d", text: "Only abuse committed by a spouse" }
    ],
    correctOptionId: "c",
    explanation:
      "Section 3(a) covers conduct that harms or endangers health, safety, life, limb or well-being, whether mental or physical, and expressly includes physical abuse, sexual abuse, verbal and emotional abuse and economic abuse.",
    citation: { sourceId: "pwdva", unitNumber: "3", label: "Protection of Women from Domestic Violence Act, Section 3(a)" }
  },
  {
    id: "what-is-domestic-violence-2",
    articleSlug: "what-is-domestic-violence",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "What does the Act treat as economic abuse?",
    options: [
      { id: "a", text: "Earning more than the other person in the household" },
      { id: "b", text: "Refusing to lend money to a relative" },
      { id: "c", text: "Any disagreement about household spending" },
      { id: "d", text: "Depriving her of resources, or disposing of household assets" }
    ],
    correctOptionId: "d",
    explanation:
      "Explanation I(iv) covers deprivation of economic or financial resources the aggrieved person is entitled to or requires out of necessity — household necessities, stridhan, property, rent and maintenance — and the disposal of household effects or alienation of assets.",
    citation: { sourceId: "pwdva", unitNumber: "3", label: "Protection of Women from Domestic Violence Act, Section 3, Explanation I(iv)" }
  },
  {
    id: "what-is-domestic-violence-3",
    articleSlug: "what-is-domestic-violence",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "What does the Act mean by a “domestic relationship”?",
    options: [
      { id: "a", text: "People who live, or have lived, together as family" },
      { id: "b", text: "Only a relationship created by a marriage registered under a personal law" },
      { id: "c", text: "Any relationship between two people who live in the same city or locality" },
      { id: "d", text: "Only a relationship where both persons hold a legal title to the shared household" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 2(f) defines a domestic relationship in those terms, and it turns on having lived together in a shared household — not on current residence or on ownership.",
    citation: { sourceId: "pwdva", unitNumber: "2", label: "Protection of Women from Domestic Violence Act, Section 2(f)" }
  },
  {
    id: "protection-officers-and-first-response-1",
    articleSlug: "protection-officers-and-first-response",
    difficulty: "easy",
    format: "true-false",
    prompt: "Only the aggrieved person herself may give information about domestic violence to a Protection Officer.",
    options: [
      { id: "a", text: "True" },
      { id: "b", text: "False" }
    ],
    correctOptionId: "b",
    explanation:
      "Any person who has reason to believe that an act of domestic violence has been, is being, or is likely to be committed may give information to the concerned Protection Officer.",
    citation: { sourceId: "pwdva", unitNumber: "4", label: "Protection of Women from Domestic Violence Act, Section 4(1)" }
  },
  {
    id: "protection-officers-and-first-response-2",
    articleSlug: "protection-officers-and-first-response",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "A police officer who receives a complaint of domestic violence must inform the aggrieved person of which of these?",
    options: [
      { id: "a", text: "The likely outcome of her case" },
      { id: "b", text: "The name of the judge who will hear it" },
      { id: "c", text: "Her right to free legal services under the 1987 Act" },
      { id: "d", text: "The amount of compensation she will receive" }
    ],
    correctOptionId: "c",
    explanation:
      "Section 5 requires the officer to inform her of her right to apply for the various orders, of the availability of service providers and Protection Officers, and of her right to free legal services under the Legal Services Authorities Act, 1987.",
    citation: { sourceId: "pwdva", unitNumber: "5", label: "Protection of Women from Domestic Violence Act, Section 5" }
  },
  {
    id: "protection-officers-and-first-response-3",
    articleSlug: "protection-officers-and-first-response",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "Which of these is a duty of a Protection Officer under section 9?",
    options: [
      { id: "a", text: "To decide, after hearing both sides, whether domestic violence in fact occurred" },
      { id: "b", text: "To conduct the prosecution of the respondent personally before the Magistrate" },
      { id: "c", text: "To arrest the respondent without a warrant and produce him before the Magistrate" },
      { id: "d", text: "To make a domestic incident report and circulate copies" }
    ],
    correctOptionId: "d",
    explanation:
      "Section 9(1)(b) makes it the Protection Officer's duty to make a domestic incident report to the Magistrate on receiving a complaint, and to forward copies to the police station in whose jurisdiction the violence is alleged and to service providers in that area.",
    citation: { sourceId: "pwdva", unitNumber: "9", label: "Protection of Women from Domestic Violence Act, Section 9(1)(b)" }
  },
  {
    id: "orders-a-magistrate-can-pass-1",
    articleSlug: "orders-a-magistrate-can-pass",
    difficulty: "easy",
    format: "true-false",
    prompt: "A woman's right to reside in the shared household depends on her having a legal title to it.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 17 gives every woman in a domestic relationship the right to reside in the shared household, whether or not she has any right, title or beneficial interest in it.",
    citation: { sourceId: "pwdva", unitNumber: "17", label: "Protection of Women from Domestic Violence Act, Section 17" }
  },
  {
    id: "orders-a-magistrate-can-pass-2",
    articleSlug: "orders-a-magistrate-can-pass",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Which of these may a protection order under section 18 prohibit?",
    options: [
      { id: "a", text: "The aggrieved person leaving the household" },
      { id: "b", text: "The respondent trying to contact the aggrieved person at all" },
      { id: "c", text: "The respondent speaking to a lawyer" },
      { id: "d", text: "The aggrieved person taking up employment" }
    ],
    correctOptionId: "b",
    explanation:
      "Section 18 lets the Magistrate prohibit the respondent from, among other things, attempting to communicate with the aggrieved person in any form, including personal, oral, written, electronic or telephonic contact.",
    citation: { sourceId: "pwdva", unitNumber: "18", label: "Protection of Women from Domestic Violence Act, Section 18(d)" }
  },
  {
    id: "orders-a-magistrate-can-pass-3",
    articleSlug: "orders-a-magistrate-can-pass",
    difficulty: "hard",
    format: "scenario",
    scenario:
      "An application discloses, on its face, that the respondent has committed domestic violence, and there is not yet time for a full hearing.",
    prompt: "What may the Magistrate do?",
    options: [
      { id: "a", text: "Nothing until both sides have been fully heard" },
      { id: "b", text: "Refer the matter to a civil court" },
      { id: "c", text: "Grant an ex parte order on her affidavit" },
      { id: "d", text: "Order the respondent's immediate arrest" }
    ],
    correctOptionId: "c",
    explanation:
      "Section 23 allows the Magistrate to pass an interim order as he deems just and proper, and to grant an ex parte order on the aggrieved person's affidavit where the application prima facie discloses domestic violence or a likelihood of it.",
    citation: { sourceId: "pwdva", unitNumber: "23", label: "Protection of Women from Domestic Violence Act, Section 23" }
  },
  {
    id: "breach-of-a-protection-order-1",
    articleSlug: "breach-of-a-protection-order",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "What is the maximum imprisonment for breaching a protection order?",
    options: [
      { id: "a", text: "Six months" },
      { id: "b", text: "Three years" },
      { id: "c", text: "Five years" },
      { id: "d", text: "One year" }
    ],
    correctOptionId: "d",
    explanation:
      "Section 31(1) makes a breach of a protection order or interim protection order an offence punishable with imprisonment which may extend to one year, or a fine up to twenty thousand rupees, or both.",
    citation: { sourceId: "pwdva", unitNumber: "31", label: "Protection of Women from Domestic Violence Act, Section 31(1)" }
  },
  {
    id: "breach-of-a-protection-order-2",
    articleSlug: "breach-of-a-protection-order",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "How long does a protection order made under section 18 remain in force?",
    options: [
      { id: "a", text: "Until the aggrieved person applies for discharge" },
      { id: "b", text: "Six months from the date it is made" },
      { id: "c", text: "Until the respondent applies for discharge" },
      { id: "d", text: "Until the next general election" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 25(1) provides that a protection order made under section 18 shall be in force till the aggrieved person applies for discharge, though the Magistrate may alter or revoke it on a change in circumstances.",
    citation: { sourceId: "pwdva", unitNumber: "25", label: "Protection of Women from Domestic Violence Act, Section 25(1)" }
  },
  {
    id: "breach-of-a-protection-order-3",
    articleSlug: "breach-of-a-protection-order",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "On what basis may a court conclude that a breach of a protection order was committed?",
    options: [
      { id: "a", text: "Only on the evidence of two independent witnesses" },
      { id: "b", text: "Upon the sole testimony of the aggrieved person" },
      { id: "c", text: "Only on documentary evidence" },
      { id: "d", text: "Only on a confession by the respondent" }
    ],
    correctOptionId: "b",
    explanation:
      "Section 32(2) provides that upon the sole testimony of the aggrieved person, the court may conclude that an offence under section 31(1) has been committed by the accused.",
    citation: { sourceId: "pwdva", unitNumber: "32", label: "Protection of Women from Domestic Violence Act, Section 32(2)" }
  }
];
