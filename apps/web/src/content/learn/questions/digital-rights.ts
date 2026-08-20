import type { QuizQuestion } from "../types";

export const digitalRightsQuestions: QuizQuestion[] = [
  {
    id: "cybercrime-and-online-fraud-1",
    articleSlug: "cybercrime-and-online-fraud",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Under the Information Technology Act, who investigates an offence under that Act?",
    options: [
      { id: "a", text: "A police officer not below the rank of Inspector" },
      { id: "b", text: "Any constable at the nearest station" },
      { id: "c", text: "A Judicial Magistrate personally" },
      { id: "d", text: "The Controller of Certifying Authorities" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 78 provides that, notwithstanding the general criminal procedure code, a police officer not below the rank of Inspector shall investigate any offence under the Act.",
    citation: { sourceId: "it_act", unitNumber: "78", label: "IT Act, Section 78" }
  },
  {
    id: "cybercrime-and-online-fraud-2",
    articleSlug: "cybercrime-and-online-fraud",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Tampering with computer source code that the law requires to be kept is punishable with what?",
    options: [
      { id: "a", text: "A warning for a first offence" },
      { id: "b", text: "Up to three years, or a fine, or both" },
      { id: "c", text: "Imprisonment for life" },
      { id: "d", text: "A fine only, with no imprisonment" }
    ],
    correctOptionId: "b",
    explanation:
      "Section 65 punishes knowingly or intentionally concealing, destroying or altering computer source code required to be kept or maintained by law with imprisonment up to three years, or a fine up to two lakh rupees, or both.",
    citation: { sourceId: "it_act", unitNumber: "65", label: "IT Act, Section 65" }
  },
  {
    id: "cybercrime-and-online-fraud-3",
    articleSlug: "cybercrime-and-online-fraud",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "Under section 77B, an offence punishable with imprisonment of exactly three years is what?",
    options: [
      { id: "a", text: "Non-cognizable and non-bailable" },
      { id: "b", text: "Non-cognizable and bailable" },
      { id: "c", text: "Cognizable and bailable" },
      { id: "d", text: "Cognizable and non-bailable" }
    ],
    correctOptionId: "c",
    explanation:
      "Section 77B provides that an offence punishable with imprisonment of three years and above is cognizable, and an offence punishable with imprisonment of three years is bailable.",
    citation: { sourceId: "it_act", unitNumber: "77B", label: "IT Act, Section 77B" }
  },
  {
    id: "identity-theft-and-impersonation-1",
    articleSlug: "identity-theft-and-impersonation",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Which section makes it an offence to fraudulently use another person's electronic signature, password or unique identification feature?",
    options: [
      { id: "a", text: "Section 66B" },
      { id: "b", text: "Section 66E" },
      { id: "c", text: "Section 71" },
      { id: "d", text: "Section 66C" }
    ],
    correctOptionId: "d",
    explanation:
      "Section 66C is the identity theft provision: fraudulently or dishonestly using the electronic signature, password or any other unique identification feature of another person.",
    citation: { sourceId: "it_act", unitNumber: "66C", label: "IT Act, Section 66C" }
  },
  {
    id: "identity-theft-and-impersonation-2",
    articleSlug: "identity-theft-and-impersonation",
    difficulty: "medium",
    format: "scenario",
    scenario:
      "A caller pretends to be a bank official and, by that pretence, persuades someone to transfer money.",
    prompt: "Which IT Act provision most directly describes this conduct?",
    options: [
      { id: "a", text: "Cheating by personation using a computer resource" },
      { id: "b", text: "Tampering with computer source documents" },
      { id: "c", text: "Cyber terrorism" },
      { id: "d", text: "Publishing an electronic signature certificate fraudulently" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 66D covers cheating by personation by means of any communication device or computer resource, punishable with imprisonment up to three years and a fine up to one lakh rupees.",
    citation: { sourceId: "it_act", unitNumber: "66D", label: "IT Act, Section 66D" }
  },
  {
    id: "identity-theft-and-impersonation-3",
    articleSlug: "identity-theft-and-impersonation",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "Under section 84C, what punishment attaches to an attempt to commit an offence where no express provision is made for the attempt?",
    options: [
      { id: "a", text: "The same punishment as the completed offence" },
      { id: "b", text: "Up to half the longest term provided for that offence" },
      { id: "c", text: "A fine only" },
      { id: "d", text: "No punishment at all" }
    ],
    correctOptionId: "b",
    explanation:
      "Section 84C provides for imprisonment which may extend to one-half of the longest term of imprisonment provided for the offence, or the fine provided for it, or both.",
    citation: { sourceId: "it_act", unitNumber: "84C", label: "IT Act, Section 84C" }
  },
  {
    id: "privacy-basics-1",
    articleSlug: "privacy-basics",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Section 66E makes it an offence to capture, publish or transmit what, without consent?",
    options: [
      { id: "a", text: "Any photograph of any person taken without asking them first" },
      { id: "b", text: "Any recording of a person made while they are in a public place" },
      { id: "c", text: "The image of a person's private area, in violation of privacy" },
      { id: "d", text: "Any message forwarded to a group without the sender's permission" }
    ],
    correctOptionId: "c",
    explanation:
      "Section 66E punishes intentionally or knowingly capturing, publishing or transmitting the image of a private area of any person without consent, under circumstances violating that person's privacy.",
    citation: { sourceId: "it_act", unitNumber: "66E", label: "IT Act, Section 66E" }
  },
  {
    id: "privacy-basics-2",
    articleSlug: "privacy-basics",
    difficulty: "medium",
    format: "true-false",
    prompt: "Under section 66E, a person can only have a reasonable expectation of privacy while in a private place.",
    options: [
      { id: "a", text: "True" },
      { id: "b", text: "False" }
    ],
    correctOptionId: "b",
    explanation:
      "The Explanation defines circumstances violating privacy by reference to a reasonable expectation, and says so regardless of whether the person is in a public or a private place.",
    citation: { sourceId: "it_act", unitNumber: "66E", label: "IT Act, Section 66E, Explanation (e)" }
  },
  {
    id: "privacy-basics-3",
    articleSlug: "privacy-basics",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "How does section 72A differ from section 72?",
    options: [
      { id: "a", text: "Section 72A covers breach of a service contract, and punishes more" },
      { id: "b", text: "Section 72A applies only to government officers exercising powers under the Act" },
      { id: "c", text: "Section 72A applies only where no wrongful loss or wrongful gain results" },
      { id: "d", text: "Section 72A creates civil liability to pay compensation, but no punishment" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 72 covers disclosure by someone who secured access under powers conferred by the Act, with a maximum of two years or one lakh rupees. Section 72A covers disclosure by a person, including an intermediary, providing services under a lawful contract, with a maximum of three years or five lakh rupees.",
    citation: { sourceId: "it_act", unitNumber: "72", label: "IT Act, Sections 72 and 72A" }
  },
  {
    id: "harmful-content-online-1",
    articleSlug: "harmful-content-online",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Which section deals with publishing or transmitting material containing a sexually explicit act in electronic form?",
    options: [
      { id: "a", text: "Section 67" },
      { id: "b", text: "Section 67A" },
      { id: "c", text: "Section 67C" },
      { id: "d", text: "Section 69A" }
    ],
    correctOptionId: "b",
    explanation:
      "Section 67 covers obscene material generally; section 67A covers material containing a sexually explicit act or conduct; section 67B covers material depicting children.",
    citation: { sourceId: "it_act", unitNumber: "67A", label: "IT Act, Section 67A" }
  },
  {
    id: "harmful-content-online-2",
    articleSlug: "harmful-content-online",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "What must the Central Government do before directing that information be blocked for public access under section 69A?",
    options: [
      { id: "a", text: "Obtain a court order in every case" },
      { id: "b", text: "Publish the direction in a newspaper" },
      { id: "c", text: "Be satisfied on the listed grounds, with reasons recorded" },
      { id: "d", text: "Obtain the intermediary's consent" }
    ],
    correctOptionId: "c",
    explanation:
      "Section 69A(1) requires satisfaction on grounds such as the sovereignty and integrity of India, defence, security of the State, friendly relations with foreign States, public order, or preventing incitement to a cognizable offence — and reasons to be recorded in writing.",
    citation: { sourceId: "it_act", unitNumber: "69A", label: "IT Act, Section 69A(1)" }
  },
  {
    id: "harmful-content-online-3",
    articleSlug: "harmful-content-online",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "The proviso to sections 67, 67A and 67B exempts material in which of these situations?",
    options: [
      { id: "a", text: "Where the material was shared in a private group rather than published openly" },
      { id: "b", text: "Where the person publishing it has not completed eighteen years of age" },
      { id: "c", text: "Where the material was created or first published outside India" },
      { id: "d", text: "Where publication is proved justified for the public good" }
    ],
    correctOptionId: "d",
    explanation:
      "The proviso covers material whose publication is proved to be justified as being for the public good on the ground that it is in the interest of science, literature, art or learning or other objects of general concern, and material kept or used for bona fide heritage or religious purposes.",
    citation: { sourceId: "it_act", unitNumber: "67B", label: "IT Act, Section 67B, proviso" }
  },
  {
    id: "intermediaries-and-takedowns-1",
    articleSlug: "intermediaries-and-takedowns",
    difficulty: "easy",
    format: "true-false",
    prompt: "An intermediary is automatically liable for everything its users post.",
    options: [
      { id: "a", text: "False" },
      { id: "b", text: "True" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 79(1) provides that, subject to the conditions in sub-sections (2) and (3), an intermediary shall not be liable for third-party information, data or communication links made available or hosted by it.",
    citation: { sourceId: "it_act", unitNumber: "79", label: "IT Act, Section 79(1)" }
  },
  {
    id: "intermediaries-and-takedowns-2",
    articleSlug: "intermediaries-and-takedowns",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "Which of these is a condition for an intermediary to keep its protection under section 79(2)?",
    options: [
      { id: "a", text: "That it reviews and approves every third-party post before it is published" },
      { id: "b", text: "That it neither initiates, directs nor alters the transmission" },
      { id: "c", text: "That it is registered in India and has an office within the country" },
      { id: "d", text: "That it publishes a monthly transparency report on the material it removed" }
    ],
    correctOptionId: "b",
    explanation:
      "Section 79(2)(b) requires that the intermediary not initiate the transmission, select the receiver of the transmission, or select or modify the information contained in it — alongside a due-diligence requirement in clause (c).",
    citation: { sourceId: "it_act", unitNumber: "79", label: "IT Act, Section 79(2)" }
  },
  {
    id: "intermediaries-and-takedowns-3",
    articleSlug: "intermediaries-and-takedowns",
    difficulty: "hard",
    format: "scenario",
    scenario:
      "A government agency notifies an intermediary that specific material on its platform is being used to commit an unlawful act, and the intermediary leaves it up.",
    prompt: "What is the effect on the intermediary's protection?",
    options: [
      { id: "a", text: "It is unaffected, as the protection is absolute" },
      { id: "b", text: "It continues until a court orders otherwise" },
      { id: "c", text: "It falls away, for failing to remove or disable access expeditiously" },
      { id: "d", text: "It continues if the material was posted anonymously" }
    ],
    correctOptionId: "c",
    explanation:
      "Section 79(3)(b) removes the exemption where, on receiving actual knowledge or being notified by the appropriate Government or its agency, the intermediary fails to expeditiously remove or disable access to that material without vitiating the evidence.",
    citation: { sourceId: "it_act", unitNumber: "79", label: "IT Act, Section 79(3)(b)" }
  },
  {
    id: "electronic-records-and-signatures-1",
    articleSlug: "electronic-records-and-signatures",
    difficulty: "easy",
    format: "multiple-choice",
    prompt: "Where a law requires information to be in writing, when is that requirement deemed satisfied by an electronic record?",
    options: [
      { id: "a", text: "When it is printed out and then signed by hand in the usual way" },
      { id: "b", text: "When it is notarised or attested by a public officer" },
      { id: "c", text: "Only where both parties to the record are government bodies or agencies" },
      { id: "d", text: "When it is in electronic form and accessible for later reference" }
    ],
    correctOptionId: "d",
    explanation:
      "Section 4 deems the writing requirement satisfied where the information is rendered or made available in electronic form and is accessible so as to be usable for subsequent reference.",
    citation: { sourceId: "it_act", unitNumber: "4", label: "IT Act, Section 4" }
  },
  {
    id: "electronic-records-and-signatures-2",
    articleSlug: "electronic-records-and-signatures",
    difficulty: "medium",
    format: "multiple-choice",
    prompt: "To whom is an electronic record attributed under section 11?",
    options: [
      { id: "a", text: "To the originator, including where it was sent on their behalf" },
      { id: "b", text: "To whoever last opened the record on their own computer resource" },
      { id: "c", text: "To the internet service provider that carried the transmission" },
      { id: "d", text: "To the addressee, from the moment the record reaches their computer resource" }
    ],
    correctOptionId: "a",
    explanation:
      "Section 11 attributes an electronic record to the originator if it was sent by the originator, by a person authorised to act on their behalf for that record, or by an information system programmed to operate automatically on their behalf.",
    citation: { sourceId: "it_act", unitNumber: "11", label: "IT Act, Section 11" }
  },
  {
    id: "electronic-records-and-signatures-3",
    articleSlug: "electronic-records-and-signatures",
    difficulty: "hard",
    format: "multiple-choice",
    prompt: "Under section 13, when does despatch of an electronic record occur, absent agreement to the contrary?",
    options: [
      { id: "a", text: "When the originator presses send" },
      { id: "b", text: "When the record leaves the originator's control" },
      { id: "c", text: "When the addressee opens the record" },
      { id: "d", text: "When a delivery receipt is generated" }
    ],
    correctOptionId: "b",
    explanation:
      "Section 13(1) provides that, save as otherwise agreed, despatch occurs when the electronic record enters a computer resource outside the control of the originator.",
    citation: { sourceId: "it_act", unitNumber: "13", label: "IT Act, Section 13(1)" }
  }
];
