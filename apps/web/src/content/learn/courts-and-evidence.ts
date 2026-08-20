import type { LearningArticle } from "./types";

export const courtsAndEvidenceArticles: LearningArticle[] = [
  {
    slug: "what-evidence-means",
    categoryId: "courts-and-evidence",
    title: "What Counts as Evidence",
    summary:
      "The basic rules of the Bharatiya Sakshya Adhiniyam: what may be proved, what oral evidence must look like, and who carries the burden of proof.",
    paragraphs: [
      {
        text: "A court does not hear everything a party wants to say. Evidence may be given of the existence or non-existence of every fact in issue, and of such other facts as the Adhiniyam declares to be relevant — and of no others. Relevance, not interest, is the gatekeeper.",
        citation: { sourceId: "bsa", unitNumber: "3", label: "BSA, Section 3" }
      },
      {
        text: "The Adhiniyam defines a document broadly enough to keep pace with technology: any matter expressed, described or otherwise recorded upon any substance by means of letters, figures or marks or any other means, intended to be used or usable for recording that matter — and it expressly includes electronic and digital records.",
        citation: { sourceId: "bsa", unitNumber: "2", label: "BSA, Section 2(1)(d)" }
      },
      {
        text: "All facts except the contents of documents may be proved by oral evidence. The contents of a document are proved by producing the document, not by describing it from memory.",
        citation: { sourceId: "bsa", unitNumber: "54", label: "BSA, Section 54" }
      },
      {
        text: "Oral evidence must be direct in every case. A fact that could be seen must be proved by a witness who says they saw it; a fact that could be heard, by a witness who says they heard it; a fact perceptible by another sense, by a witness who says they perceived it that way; and an opinion, by the person who holds it and on the grounds on which they hold it.",
        citation: { sourceId: "bsa", unitNumber: "55", label: "BSA, Section 55" }
      },
      {
        text: "The burden of proof rests where the assertion is made. Whoever wants a court to give judgment on a legal right or liability dependent on facts they assert must prove those facts exist. Put another way, the burden lies on the person who would fail if no evidence at all were given on either side.",
        citation: { sourceId: "bsa", unitNumber: "104", label: "BSA, Sections 104-105" }
      },
      {
        text: "One important shift applies to an accused person. Where a person accused of an offence claims that circumstances bring the case within a general exception in the Bharatiya Nyaya Sanhita, or within a special exception or proviso, the burden of proving those circumstances is on them, and the court presumes the absence of such circumstances until they are proved.",
        citation: { sourceId: "bsa", unitNumber: "108", label: "BSA, Section 108" }
      },
      {
        text: "Numbers do not decide cases. No particular number of witnesses is required for the proof of any fact.",
        citation: { sourceId: "bsa", unitNumber: "139", label: "BSA, Section 139" }
      }
    ],
    scopeNote:
      "These are the general rules of the law of evidence. Whether a particular fact is relevant, or whether a burden has been discharged, is decided by a court on the material before it in that case."
  },
  {
    slug: "documents-and-electronic-records",
    categoryId: "courts-and-evidence",
    title: "Documents and Electronic Records",
    summary:
      "Primary and secondary evidence, and the conditions on which a printout, a file or a recording is admissible as a document.",
    paragraphs: [
      {
        text: "There are exactly two ways to prove what a document says: the contents of a document may be proved either by primary or by secondary evidence.",
        citation: { sourceId: "bsa", unitNumber: "56", label: "BSA, Section 56" }
      },
      {
        text: "Primary evidence means the document itself, produced for the inspection of the court. Where a document is executed in several parts, each part is primary evidence; where it is executed in counterpart, each counterpart is primary evidence against the parties who executed it; and where a number of documents are made by one uniform process such as printing, each is primary evidence of the contents of the rest.",
        citation: { sourceId: "bsa", unitNumber: "57", label: "BSA, Section 57" }
      },
      {
        text: "The Adhiniyam extends that idea to digital storage. Where an electronic or digital record is created or stored, and that storage occurs simultaneously or sequentially in multiple files, each such file is primary evidence; and where an electronic or digital record is produced from proper custody, it is primary evidence unless it is disputed.",
        citation: { sourceId: "bsa", unitNumber: "57", label: "BSA, Section 57, Explanations 4-5" }
      },
      {
        text: "Secondary evidence is the fallback, and the Act lists what it includes: certified copies; copies made from the original by mechanical processes that themselves ensure accuracy, and copies compared with those; copies made from or compared with the original; counterparts as against parties who did not execute them; oral accounts of the contents given by someone who has seen the document; oral admissions; written admissions; and the evidence of a skilled person who has examined voluminous documents that cannot conveniently be examined in court.",
        citation: { sourceId: "bsa", unitNumber: "58", label: "BSA, Section 58" }
      },
      {
        text: "Being electronic is not, by itself, a reason to exclude anything. Nothing in the Adhiniyam denies the admissibility of an electronic or digital record on the ground that it is electronic, and such a record has — subject to the admissibility conditions — the same legal effect, validity and enforceability as any other document.",
        citation: { sourceId: "bsa", unitNumber: "61", label: "BSA, Section 61" }
      },
      {
        text: "The conditions live in a separate section. Information contained in an electronic record which is printed on paper, or stored, recorded or copied in optical or magnetic media, semiconductor memory, or any electronic form — the computer output — is deemed to be a document and is admissible without further proof or production of the original, provided the conditions the section sets out about the computer or communication device are satisfied.",
        citation: { sourceId: "bsa", unitNumber: "63", label: "BSA, Section 63" }
      }
    ],
    scopeNote:
      "Section 63 sets out detailed technical conditions and a certificate requirement for electronic evidence. Whether a particular printout, file or recording satisfies them is a question decided in the case, not something a summary can answer."
  },
  {
    slug: "witnesses-and-cross-examination",
    categoryId: "courts-and-evidence",
    title: "Witnesses and Cross-Examination",
    summary:
      "Who may testify, the three stages of examining a witness, what a leading question is, and the limits a court places on questioning.",
    paragraphs: [
      {
        text: "Competence is the rule and incapacity the exception. All persons are competent to testify unless the court considers that they are prevented from understanding the questions put to them, or from giving rational answers, by tender years, extreme old age, disease of body or mind, or any other cause of the same kind. A person of unsound mind is not incompetent unless their unsoundness actually prevents understanding and rational answers.",
        citation: { sourceId: "bsa", unitNumber: "124", label: "BSA, Section 124" }
      },
      {
        text: "Examination happens in three named stages. Examination by the party who calls the witness is examination-in-chief; examination by the adverse party is cross-examination; and examination after cross-examination, by the party who called the witness, is re-examination.",
        citation: { sourceId: "bsa", unitNumber: "142", label: "BSA, Section 142" }
      },
      {
        text: "They also happen in that order, and their scope differs. Examination-in-chief and cross-examination must relate to relevant facts, but cross-examination need not be confined to the facts the witness testified to in chief. Re-examination is directed to explaining matters raised in cross-examination, and if new matter is introduced with the court's permission, the adverse party may cross-examine further on it.",
        citation: { sourceId: "bsa", unitNumber: "143", label: "BSA, Section 143" }
      },
      {
        text: "A leading question is any question suggesting the answer the questioner wishes or expects to receive. Leading questions must not be asked in examination-in-chief or re-examination if the adverse party objects, except with the court's permission — though the court must permit them on introductory or undisputed matters, or matters already sufficiently proved. In cross-examination, leading questions may be asked freely.",
        citation: { sourceId: "bsa", unitNumber: "146", label: "BSA, Section 146" }
      },
      {
        text: "Cross-examination is not unlimited. The court may forbid questions it regards as indecent or scandalous, unless they relate to the facts in issue or to matters necessary to determine whether those facts existed; and the court must forbid any question that appears intended to insult or annoy, or which — though proper in itself — appears needlessly offensive in form.",
        citation: { sourceId: "bsa", unitNumber: "154", label: "BSA, Sections 154-155" }
      },
      {
        text: "A specific protection applies in prosecutions for sexual offences. Where the question of consent is in issue, evidence of the victim's character, or of their previous sexual experience with any person, is not relevant to the issue of consent or the quality of consent.",
        citation: { sourceId: "bsa", unitNumber: "48", label: "BSA, Section 48" }
      },
      {
        text: "A witness's credit can be attacked, but only in defined ways: by the evidence of persons who, from their knowledge of the witness, believe them unworthy of credit; by proof that the witness was bribed or accepted a corrupt inducement; or by proof of former statements inconsistent with their evidence.",
        citation: { sourceId: "bsa", unitNumber: "158", label: "BSA, Section 158" }
      }
    ]
  },
  {
    slug: "confessions-and-police-statements",
    categoryId: "courts-and-evidence",
    title: "Confessions and Statements to the Police",
    summary:
      "Why a confession to a police officer cannot be proved against you, what a police officer can require during an investigation, and how a Magistrate records a confession.",
    paragraphs: [
      {
        text: "The rule is stated flatly. No confession made to a police officer shall be proved as against a person accused of any offence. Nor may a confession made by a person while in the custody of a police officer be proved against them, unless it was made in the immediate presence of a Magistrate.",
        citation: { sourceId: "bsa", unitNumber: "23", label: "BSA, Section 23(1)-(2)" }
      },
      {
        text: "There is one narrow exception, and it is about discovery rather than admission. Where a fact is deposed to as discovered in consequence of information received from an accused person in police custody, so much of that information as relates distinctly to the fact discovered may be proved — whether or not it amounts to a confession.",
        citation: { sourceId: "bsa", unitNumber: "23", label: "BSA, Section 23(2), proviso" }
      },
      {
        text: "A confession is also irrelevant if it was not freely made. A confession by an accused person is irrelevant in a criminal proceeding if the court considers it was caused by an inducement, threat, coercion or promise referring to the charge, coming from a person in authority, and sufficient to give the accused reasonable grounds for supposing they would gain an advantage or avoid an evil of a temporal nature in the proceedings.",
        citation: { sourceId: "bsa", unitNumber: "22", label: "BSA, Section 22" }
      },
      {
        text: "During an investigation a police officer may require attendance by written order from anyone within the limits of their own or an adjoining station who appears acquainted with the facts. But no male person under fifteen or above sixty, no woman, and no mentally or physically disabled person or person with acute illness may be required to attend anywhere other than where they reside — although they may attend the police station if they are willing to.",
        citation: { sourceId: "bnss", unitNumber: "179", label: "BNSS, Section 179(1)" }
      },
      {
        text: "A person examined by the police is bound to answer truly all questions relating to the case — except questions whose answers would have a tendency to expose them to a criminal charge, penalty or forfeiture. The officer may reduce a statement to writing, making a separate and true record for each person, and the statement may also be recorded by audio-video electronic means.",
        citation: { sourceId: "bnss", unitNumber: "180", label: "BNSS, Section 180(1)-(3)" }
      },
      {
        text: "A confession recorded by a Magistrate follows a protective procedure. Before recording it, the Magistrate must explain to the person that they are not bound to make a confession and that if they do, it may be used as evidence against them — and must not record it unless, on questioning the person, the Magistrate has reason to believe it is being made voluntarily. A police officer on whom a Magistrate's powers have been conferred may not record a confession.",
        citation: { sourceId: "bnss", unitNumber: "183", label: "BNSS, Section 183(1)-(2)" }
      },
      {
        text: "These statutory protections sit alongside a constitutional one: no person accused of any offence shall be compelled to be a witness against himself.",
        citation: { sourceId: "constitution", unitNumber: "20", label: "Constitution, Article 20(3)" }
      }
    ],
    scopeNote:
      "This is general information about the law of confessions and statements. If you are actually being questioned in an investigation, what to say is a decision to make with a lawyer, not from a general article — and free legal aid is available through the legal services authorities."
  },
  {
    slug: "privileged-communications",
    categoryId: "courts-and-evidence",
    title: "What You Tell Your Lawyer",
    summary:
      "The professional privilege that protects communications with an advocate, its two exceptions, and the related protections the Adhiniyam recognises.",
    paragraphs: [
      {
        text: "The protection is put as a prohibition on the advocate. No advocate may, at any time and unless with the client's express consent, disclose any communication made to them in the course and for the purpose of their service as an advocate, state the contents or condition of any document they became acquainted with in that service, or disclose any advice they gave the client in the course of it.",
        citation: { sourceId: "bsa", unitNumber: "132", label: "BSA, Section 132(1)" }
      },
      {
        text: "Two things fall outside the protection: a communication made in furtherance of any illegal purpose, and any fact observed by the advocate in the course of their service showing that a crime or fraud has been committed since the service began. It is immaterial whether the client drew the advocate's attention to that fact.",
        citation: { sourceId: "bsa", unitNumber: "132", label: "BSA, Section 132(1), proviso and (2)" }
      },
      {
        text: "The obligation does not expire with the retainer. The Adhiniyam states expressly that it continues after the professional service has ceased.",
        citation: { sourceId: "bsa", unitNumber: "132", label: "BSA, Section 132, Explanation" }
      },
      {
        text: "The client is protected from the other direction too. No one shall be compelled to disclose to the court any confidential communication between them and their legal adviser — unless they offer themselves as a witness, in which case they may be compelled to disclose such communications as the court finds necessary to explain evidence they have given, but no others.",
        citation: { sourceId: "bsa", unitNumber: "134", label: "BSA, Section 134" }
      },
      {
        text: "Volunteering evidence does not waive the privilege by accident. The Adhiniyam provides that the privilege is not waived by a party merely volunteering evidence.",
        citation: { sourceId: "bsa", unitNumber: "133", label: "BSA, Section 133" }
      },
      {
        text: "Marriage carries its own protection: no person who is or has been married may be compelled to disclose any communication made to them during marriage by a person to whom they are or have been married, and no such person may be permitted to disclose it — except in a suit between married persons, or a proceeding in which one is prosecuted for a crime committed against the other.",
        citation: { sourceId: "bsa", unitNumber: "128", label: "BSA, Section 128" }
      }
    ]
  }
];
