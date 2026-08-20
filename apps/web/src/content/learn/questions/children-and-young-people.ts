import type { QuizQuestion } from "../types";

export const childrenQuestions: QuizQuestion[] = [
  {
    id: "principles-of-juvenile-justice-1",
    articleSlug: "principles-of-juvenile-justice",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Which body deals with a child alleged to have committed an offence?",
    options: [
      { id: "a", text: "The Child Welfare Committee" },
      { id: "b", text: "The Juvenile Justice Board" },
      { id: "c", text: "The District Legal Services Authority" },
      { id: "d", text: "The Central Adoption Resource Authority" }
    ],
    correctOptionId: "b",
    explanation:
      "A child in conflict with law — one alleged or found to have committed an offence — is dealt with by a Juvenile Justice Board. A Child Welfare Committee deals with children in need of care and protection.",
    citation: { sourceId: "jj2015", unitNumber: "2", label: "Juvenile Justice Act, Section 2(13)" }
  },
  {
    id: "principles-of-juvenile-justice-2",
    articleSlug: "principles-of-juvenile-justice",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Under the principle of presumption of innocence, up to what age is a child presumed innocent of mala fide or criminal intent?",
    options: [
      { id: "a", text: "Twelve years" },
      { id: "b", text: "Sixteen years" },
      { id: "c", text: "Eighteen years" },
      { id: "d", text: "Twenty-one years" }
    ],
    correctOptionId: "c",
    explanation:
      "The principle of presumption of innocence states that any child shall be presumed to be innocent of any mala fide or criminal intent up to the age of eighteen years.",
    citation: { sourceId: "jj2015", unitNumber: "3", label: "Juvenile Justice Act, Section 3(i)" }
  },
  {
    id: "principles-of-juvenile-justice-3",
    articleSlug: "principles-of-juvenile-justice",
    difficulty: "hard",
    format: "scenario",
    scenario:
      "A newspaper wants to publish the name and school of a child who is a witness in a criminal case.",
    prompt: "What does the Juvenile Justice Act say?",
    options: [
      { id: "a", text: "It is permitted where the child's parents or guardian give their written agreement" },
      { id: "b", text: "It is permitted once the inquiry or trial concerning the child has ended" },
      { id: "c", text: "It is permitted where the child has completed sixteen years of age" },
      { id: "d", text: "No report may disclose anything that could identify the child" }
    ],
    correctOptionId: "d",
    explanation:
      "Section 74 prohibits any report disclosing the name, address, school or other identifying particulars of a child in conflict with law, a child in need of care and protection, or a child victim or witness — and makes contravention punishable with imprisonment up to six months or a fine up to two lakh rupees, or both.",
    citation: { sourceId: "jj2015", unitNumber: "74", label: "Juvenile Justice Act, Section 74" }
  },
  {
    id: "juvenile-justice-board-1",
    articleSlug: "juvenile-justice-board",
    difficulty: "easy",
    format: "true-false",
    prompt: "A child alleged to be in conflict with law may be placed in a police lock-up while awaiting production before the Board.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 10(1) provides that in no case shall a child alleged to be in conflict with law be placed in a police lock-up or lodged in a jail.",
    citation: { sourceId: "jj2015", unitNumber: "10", label: "Juvenile Justice Act, Section 10(1)" }
  },
  {
    id: "juvenile-justice-board-2",
    articleSlug: "juvenile-justice-board",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "How does bail work for a person who is apparently a child alleged to be in conflict with law?",
    options: [
      { id: "a", text: "Bail is available only for bailable offences" },
      { id: "b", text: "Release on bail is the rule, bailable offence or not" },
      { id: "c", text: "Bail is never available" },
      { id: "d", text: "Bail requires the consent of the complainant" }
    ],
    correctOptionId: "b",
    explanation:
      "Section 12(1) requires such a person to be released on bail with or without surety, or placed under supervision, notwithstanding anything in the general criminal procedure code — and it applies whether the alleged offence is bailable or non-bailable.",
    citation: { sourceId: "jj2015", unitNumber: "12", label: "Juvenile Justice Act, Section 12(1)" }
  },
  {
    id: "juvenile-justice-board-3",
    articleSlug: "juvenile-justice-board",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "What is the purpose of a preliminary assessment under section 15?",
    options: [
      { id: "a", text: "To decide whether the child in fact committed the offence alleged against them" },
      { id: "b", text: "To fix, in advance, the sentence the child will receive if found guilty" },
      { id: "c", text: "To assess the child's capacity to commit and understand the offence" },
      { id: "d", text: "To decide whether the child needs care and protection" }
    ],
    correctOptionId: "c",
    explanation:
      "The Explanation to section 15 clarifies that a preliminary assessment is not a trial, but is to assess the capacity of the child to commit and to understand the consequences of the alleged offence.",
    citation: { sourceId: "jj2015", unitNumber: "15", label: "Juvenile Justice Act, Section 15(1)" }
  },
  {
    id: "children-in-need-of-care-1",
    articleSlug: "children-in-need-of-care",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Who may produce a child in need of care and protection before a Child Welfare Committee?",
    options: [
      { id: "a", text: "Only a police officer or a designated Child Welfare Police Officer" },
      { id: "b", text: "Only a parent, guardian or other person having charge of the child" },
      { id: "c", text: "Only a District Judge, on an application made to the court" },
      { id: "d", text: "A wide list, including a social worker or the child themselves" }
    ],
    correctOptionId: "d",
    explanation:
      "Section 31(1) lists police officers, public servants, Childline Services, recognised organisations, Child Welfare or probation officers, social workers, public-spirited citizens, medical staff — and the child themselves.",
    citation: { sourceId: "jj2015", unitNumber: "31", label: "Juvenile Justice Act, Section 31(1)" }
  },
  {
    id: "children-in-need-of-care-2",
    articleSlug: "children-in-need-of-care",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Someone finds a child who appears to be abandoned. Within what time must they report it?",
    options: [
      { id: "a", text: "Twenty-four hours, excluding journey time" },
      { id: "b", text: "Seven days, or longer with the officer in charge's approval" },
      { id: "c", text: "One month" },
      { id: "d", text: "There is no time limit" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 32(1) requires information within twenty-four hours, excluding the time necessary for the journey, to Childline Services, the nearest police station, a Child Welfare Committee or the District Child Protection Unit — or handing the child to a registered child care institution.",
    citation: { sourceId: "jj2015", unitNumber: "32", label: "Juvenile Justice Act, Section 32(1)" }
  },
  {
    id: "children-in-need-of-care-3",
    articleSlug: "children-in-need-of-care",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "How often must a Child Welfare Committee inspect residential facilities for children in need of care and protection?",
    options: [
      { id: "a", text: "At least twice a year" },
      { id: "b", text: "At least two visits per month" },
      { id: "c", text: "At least once a month" },
      { id: "d", text: "Only when a complaint is received" }
    ],
    correctOptionId: "b",
    explanation:
      "Section 30(viii) requires at least two inspection visits per month of residential facilities for children in need of care and protection, with recommendations for improvement to the District Child Protection Unit and the State Government.",
    citation: { sourceId: "jj2015", unitNumber: "30", label: "Juvenile Justice Act, Section 30(viii)" }
  },
  {
    id: "offences-against-children-1",
    articleSlug: "offences-against-children",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Which section punishes cruelty to a child by a person having actual charge of or control over them?",
    options: [
      { id: "a", text: "Section 79" },
      { id: "b", text: "Section 82" },
      { id: "c", text: "Section 75" },
      { id: "d", text: "Section 83" }
    ],
    correctOptionId: "c",
    explanation:
      "Section 75 punishes assaulting, abandoning, abusing, exposing or wilfully neglecting a child in a manner likely to cause unnecessary mental or physical suffering, with imprisonment up to three years or a fine of one lakh rupees, or both.",
    citation: { sourceId: "jj2015", unitNumber: "75", label: "Juvenile Justice Act, Section 75" }
  },
  {
    id: "offences-against-children-2",
    articleSlug: "offences-against-children",
    difficulty: "medium",
    format: "scenario",
    scenario:
      "A child has been used for begging by a person who had control over them.",
    prompt: "What does the Act say about how that child is treated?",
    options: [
      { id: "a", text: "The child may be treated as a child in conflict with law and produced before the Board" },
      { id: "b", text: "The child is returned to the same guardian once that person has been warned" },
      { id: "c", text: "The child is fined along with the adult who used them for begging" },
      { id: "d", text: "The child is not a child in conflict with law, and goes to the Committee" }
    ],
    correctOptionId: "d",
    explanation:
      "A proviso to section 76(2) states that the child shall not be considered a child in conflict with law under any circumstances, and shall be removed from the charge or control of that guardian and produced before the Committee for appropriate rehabilitation.",
    citation: { sourceId: "jj2015", unitNumber: "76", label: "Juvenile Justice Act, Section 76(2), proviso" }
  },
  {
    id: "offences-against-children-3",
    articleSlug: "offences-against-children",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "Besides a fine or imprisonment, what additional consequence follows for an employee of a child care institution convicted of corporal punishment?",
    options: [
      { id: "a", text: "Dismissal, and debarment from working with children" },
      { id: "b", text: "A public apology" },
      { id: "c", text: "Transfer to another institution" },
      { id: "d", text: "A period of probation only" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 82(2) provides that a person convicted under that section is also liable for dismissal from service and shall be debarred from working directly with children thereafter.",
    citation: { sourceId: "jj2015", unitNumber: "82", label: "Juvenile Justice Act, Section 82(2)" }
  }
];
