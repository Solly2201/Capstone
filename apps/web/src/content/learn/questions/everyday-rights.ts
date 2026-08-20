import type { QuizQuestion } from "../types";

export const everydayRightsQuestions: QuizQuestion[] = [
  {
    id: "cheating-and-dishonesty-offences-1",
    articleSlug: "cheating-and-dishonesty-offences",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "What two elements does cheating require under section 318?",
    options: [
      { id: "a", text: "A written contract and a broken promise" },
      { id: "b", text: "A financial loss of at least one lakh rupees" },
      { id: "c", text: "Deception, and an inducement causing delivery or harm" },
      { id: "d", text: "A prior warning to the victim" }
    ],
    correctOptionId: "c",
    explanation:
      "A person cheats if, by deceiving another, they fraudulently or dishonestly induce delivery of property, or intentionally induce an act or omission causing or likely to cause damage or harm in body, mind, reputation or property.",
    citation: { sourceId: "bns", unitNumber: "318", label: "BNS, Section 318(1)" }
  },
  {
    id: "cheating-and-dishonesty-offences-2",
    articleSlug: "cheating-and-dishonesty-offences",
    difficulty: "medium",
    format: "true-false",
    prompt: "Staying silent about a fact can never amount to deception for the purposes of cheating.",
    options: [
      { id: "a", text: "True" },
      { id: "b", text: "False" }
    ],
    correctOptionId: "b",
    explanation:
      "The Explanation to section 318 states that a dishonest concealment of facts is a deception within the meaning of that section.",
    citation: { sourceId: "bns", unitNumber: "318", label: "BNS, Section 318, Explanation" }
  },
  {
    id: "cheating-and-dishonesty-offences-3",
    articleSlug: "cheating-and-dishonesty-offences",
    difficulty: "hard",
    format: "scenario",
    scenario:
      "Someone forges a document, intending that it be used to cheat another person.",
    prompt: "What is the maximum imprisonment under section 336 for that form of forgery?",
    options: [
      { id: "a", text: "Seven years" },
      { id: "b", text: "Two years" },
      { id: "c", text: "Three years" },
      { id: "d", text: "Ten years" }
    ],
    correctOptionId: "a",
    explanation:
      "Forgery generally carries up to two years under section 336(2); forgery intended so the forged document or record will be used for cheating carries up to seven years and a fine under section 336(3).",
    citation: { sourceId: "bns", unitNumber: "336", label: "BNS, Section 336(3)" }
  },
  {
    id: "theft-and-property-offences-1",
    articleSlug: "theft-and-property-offences",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "What does theft require, besides taking movable property?",
    options: [
      { id: "a", text: "That the property be worth more than five thousand rupees" },
      { id: "b", text: "A dishonest intention, and moving it out of another's possession" },
      { id: "c", text: "That the taking happen at night" },
      { id: "d", text: "That the owner report it within twenty-four hours" }
    ],
    correctOptionId: "b",
    explanation:
      "Section 303(1) requires an intention to take dishonestly any movable property out of the possession of a person without that person's consent, and a moving of the property in order to take it.",
    citation: { sourceId: "bns", unitNumber: "303", label: "BNS, Section 303(1)" }
  },
  {
    id: "theft-and-property-offences-2",
    articleSlug: "theft-and-property-offences",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "When does theft become snatching?",
    options: [
      { id: "a", text: "When the property taken is worth more than a threshold amount fixed by the State" },
      { id: "b", text: "When the offender uses a vehicle to approach the victim or to get away afterwards" },
      { id: "c", text: "When the offender suddenly or forcibly grabs it from a person" },
      { id: "d", text: "When more than one person acts together in taking the property" }
    ],
    correctOptionId: "c",
    explanation:
      "Section 304(1) defines snatching as theft committed by suddenly, quickly or forcibly seizing, securing, grabbing or taking away movable property from a person or from their possession.",
    citation: { sourceId: "bns", unitNumber: "304", label: "BNS, Section 304(1)" }
  },
  {
    id: "theft-and-property-offences-3",
    articleSlug: "theft-and-property-offences",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "Who may give the consent that prevents a taking from being theft?",
    options: [
      { id: "a", text: "Only the registered owner of the property, and only in writing" },
      { id: "b", text: "Only a person who has completed eighteen years of age" },
      { id: "c", text: "Only a court, by an order made before the property is moved" },
      { id: "d", text: "The person in possession, or anyone with authority to give it" }
    ],
    correctOptionId: "d",
    explanation:
      "Explanation 5 to section 303 provides that the consent may be express or implied, and may be given either by the person in possession or by any person having authority for that purpose, express or implied.",
    citation: { sourceId: "bns", unitNumber: "303", label: "BNS, Section 303, Explanation 5" }
  },
  {
    id: "threats-insults-and-reputation-1",
    articleSlug: "threats-insults-and-reputation",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "What makes a threat criminal intimidation under section 351?",
    options: [
      { id: "a", text: "That it threatens injury, intending to alarm or to compel conduct" },
      { id: "b", text: "That it is made in public, or in the hearing of people other than the person threatened" },
      { id: "c", text: "That it is repeated on more than one occasion after an earlier warning" },
      { id: "d", text: "That it is put in writing, or recorded in some other permanent form" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 351(1) covers threatening another with injury to their person, reputation or property — or to a person they are interested in — with intent to cause alarm, or to make them do or omit something as the means of avoiding the threat.",
    citation: { sourceId: "bns", unitNumber: "351", label: "BNS, Section 351(1)" }
  },
  {
    id: "threats-insults-and-reputation-2",
    articleSlug: "threats-insults-and-reputation",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Under section 356, when is an imputation said to harm a person's reputation?",
    options: [
      { id: "a", text: "Whenever the person concerned says they felt offended or humiliated by it" },
      { id: "b", text: "When it lowers their character or credit in the estimation of others" },
      { id: "c", text: "Whenever it is published or repeated to more than a handful of other people" },
      { id: "d", text: "Whenever it concerns their private life rather than their public conduct" }
    ],
    correctOptionId: "b",
    explanation:
      "Explanation 4 defines harm narrowly: no imputation harms reputation unless it directly or indirectly, in the estimation of others, lowers the moral or intellectual character, the character in respect of caste or calling, or the credit of that person.",
    citation: { sourceId: "bns", unitNumber: "356", label: "BNS, Section 356, Explanation 4" }
  },
  {
    id: "threats-insults-and-reputation-3",
    articleSlug: "threats-insults-and-reputation",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "What is the minimum imprisonment under section 74 for assault or criminal force to a woman with intent to outrage her modesty?",
    options: [
      { id: "a", text: "There is no minimum" },
      { id: "b", text: "Six months" },
      { id: "c", text: "One year" },
      { id: "d", text: "Three years" }
    ],
    correctOptionId: "c",
    explanation:
      "Section 74 prescribes imprisonment of either description for a term which shall not be less than one year but which may extend to five years, and also a fine.",
    citation: { sourceId: "bns", unitNumber: "74", label: "BNS, Section 74" }
  },
  {
    id: "public-nuisance-and-neighbourhood-1",
    articleSlug: "public-nuisance-and-neighbourhood",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Whom must a public nuisance affect?",
    options: [
      { id: "a", text: "A single named complainant who reports the problem to an authority" },
      { id: "b", text: "Only a government authority responsible for the place in question" },
      { id: "c", text: "Only people using a private road or other privately owned access" },
      { id: "d", text: "The public, or people in general living or working nearby" }
    ],
    correctOptionId: "d",
    explanation:
      "Section 270 defines public nuisance by reference to common injury, danger or annoyance to the public or to people in general who dwell or occupy property in the vicinity, or necessary injury to persons using a public right.",
    citation: { sourceId: "bns", unitNumber: "270", label: "BNS, Section 270" }
  },
  {
    id: "public-nuisance-and-neighbourhood-2",
    articleSlug: "public-nuisance-and-neighbourhood",
    difficulty: "medium",
    format: "true-false",
    prompt: "A common nuisance is excused if it also causes some convenience or advantage.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 270 states expressly that a common nuisance is not excused on the ground that it causes some convenience or advantage.",
    citation: { sourceId: "bns", unitNumber: "270", label: "BNS, Section 270" }
  },
  {
    id: "public-nuisance-and-neighbourhood-3",
    articleSlug: "public-nuisance-and-neighbourhood",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "How do sections 271 and 272 differ in punishing acts likely to spread a dangerous infection?",
    options: [
      { id: "a", text: "Section 271 applies only to doctors and others in a medical occupation" },
      { id: "b", text: "Section 271 covers negligence; section 272 covers malignant acts" },
      { id: "c", text: "Section 272 applies only where an epidemic has been formally declared" },
      { id: "d", text: "They are identical in scope and carry exactly the same maximum punishment" }
    ],
    correctOptionId: "b",
    explanation:
      "Section 271 punishes an unlawful or negligent act likely to spread infection of a disease dangerous to life with up to six months, or a fine, or both. Section 272 punishes doing such an act malignantly with up to two years, or a fine, or both.",
    citation: { sourceId: "bns", unitNumber: "271", label: "BNS, Sections 271 and 272" }
  }
];
