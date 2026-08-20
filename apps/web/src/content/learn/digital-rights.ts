import type { LearningArticle } from "./types";

// Note on citations in this file: the ingested Information Technology Act
// PDF does not contain the body text of sections 43, 43A, 66 and 66A --
// only their entries in the arrangement-of-sections table. Section 66's
// operative sentence does survive, inside the chunk for section 65, and
// is cited there. Nothing below restates the contents of a section whose
// text this project has not actually ingested; the gaps are stated in the
// scope notes instead.
export const digitalRightsArticles: LearningArticle[] = [
  {
    slug: "cybercrime-and-online-fraud",
    categoryId: "digital-rights",
    title: "Cybercrime and Online Fraud",
    summary:
      "The computer-related offences the Information Technology Act defines, how they are investigated, and which of them are bailable.",
    paragraphs: [
      {
        text: "The Information Technology Act's general computer-offence provision is short. If a person dishonestly or fraudulently does any of the acts the Act lists as damage to a computer, computer system or network, they are punishable with imprisonment which may extend to three years, or a fine which may extend to five lakh rupees, or both. The same acts done without that dishonest or fraudulent intent attract civil liability to pay compensation rather than punishment.",
        citation: { sourceId: "it_act", unitNumber: "65", label: "IT Act, Section 66" }
      },
      {
        text: "Tampering with computer source code is a separate offence. Knowingly or intentionally concealing, destroying or altering — or causing another to conceal, destroy or alter — computer source code that is required to be kept or maintained by law is punishable with imprisonment up to three years, or a fine up to two lakh rupees, or both. Source code here means the listing of programmes, computer commands, design and layout, and programme analysis of a computer resource in any form.",
        citation: { sourceId: "it_act", unitNumber: "65", label: "IT Act, Section 65" }
      },
      {
        text: "Receiving stolen digital property is also an offence. Whoever dishonestly receives or retains a stolen computer resource or communication device, knowing or having reason to believe it to be stolen, is punishable with imprisonment which may extend to three years, or a fine which may extend to one lakh rupees, or both.",
        citation: { sourceId: "it_act", unitNumber: "66B", label: "IT Act, Section 66B" }
      },
      {
        text: "At the most serious end sits cyber terrorism. It covers, among other things, denying access to an authorised person, penetrating a computer resource without authorisation, or introducing a computer contaminant, with intent to threaten the unity, integrity, security or sovereignty of India or to strike terror — where the conduct causes or is likely to cause death, injury, damage to property, or disruption of supplies or services essential to the life of the community.",
        citation: { sourceId: "it_act", unitNumber: "66F", label: "IT Act, Section 66F" }
      },
      {
        text: "Investigation is reserved to a senior officer. Notwithstanding the general criminal procedure code, an offence under this Act is to be investigated by a police officer not below the rank of Inspector.",
        citation: { sourceId: "it_act", unitNumber: "78", label: "IT Act, Section 78" }
      },
      {
        text: "Whether an offence is bailable turns on a simple line. An offence punishable with imprisonment of three years and above is cognizable, and an offence punishable with imprisonment of three years is bailable.",
        citation: { sourceId: "it_act", unitNumber: "77B", label: "IT Act, Section 77B" }
      },
      {
        text: "At the national level, the Indian Computer Emergency Response Team is appointed as the national agency for incident response in cyber security. Its functions include collecting, analysing and disseminating information on cyber incidents, forecasting and issuing alerts, emergency measures for handling incidents, and coordinating incident response activities.",
        citation: { sourceId: "it_act", unitNumber: "70B", label: "IT Act, Section 70B" }
      },
      {
        text: "If the conduct also amounts to a cognizable offence under the general criminal law, the FIR route in the police section of this library applies in the ordinary way — including the rule that information about a cognizable offence must be recorded irrespective of the area where the offence was committed.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)" }
      }
    ],
    scopeNote:
      "The Information Technology Act PDF ingested by this project does not contain the body of section 43 (the list of acts that damage a computer system) or section 43A, so the specific acts section 66 refers to are not reproduced here. This page also does not cover the separate government cybercrime reporting portals, or how to recover money lost to a fraud."
  },
  {
    slug: "identity-theft-and-impersonation",
    categoryId: "digital-rights",
    title: "Identity Theft and Online Impersonation",
    summary:
      "The two provisions that most directly describe the familiar pattern of someone pretending to be a bank, an official, or a person you know.",
    paragraphs: [
      {
        text: "Identity theft is its own offence. Whoever fraudulently or dishonestly makes use of the electronic signature, password, or any other unique identification feature of another person is punishable with imprisonment which may extend to three years and is also liable to a fine which may extend to one lakh rupees.",
        citation: { sourceId: "it_act", unitNumber: "66C", label: "IT Act, Section 66C" }
      },
      {
        text: "Impersonation-based cheating is the companion provision. Whoever, by means of any communication device or computer resource, cheats by personation is punishable with imprisonment which may extend to three years and is also liable to a fine which may extend to one lakh rupees. Between them, these two sections describe most of what people mean by an online scam call, a fake profile, or a fraudulent message sent in someone else's name.",
        citation: { sourceId: "it_act", unitNumber: "66D", label: "IT Act, Section 66D" }
      },
      {
        text: "Faking the credentials themselves is treated separately. Knowingly creating, publishing or otherwise making available an electronic signature certificate for any fraudulent or unlawful purpose is punishable with imprisonment up to two years, or a fine up to one lakh rupees, or both.",
        citation: { sourceId: "it_act", unitNumber: "74", label: "IT Act, Section 74" }
      },
      {
        text: "So is lying to get one. Making a misrepresentation to, or suppressing a material fact from, the Controller or a Certifying Authority in order to obtain a licence or an electronic signature certificate is punishable with imprisonment up to two years, or a fine up to one lakh rupees, or both.",
        citation: { sourceId: "it_act", unitNumber: "71", label: "IT Act, Section 71" }
      },
      {
        text: "The Act also gives officers a power to act quickly in public places. A police officer not below the rank of Inspector, or an authorised government officer, may enter any public place and search and arrest without warrant a person reasonably suspected of having committed, committing, or being about to commit an offence under the Act. Public place here includes a public conveyance, a hotel, a shop or any other place accessible to the public.",
        citation: { sourceId: "it_act", unitNumber: "80", label: "IT Act, Section 80" }
      },
      {
        text: "Attempts and abetment are covered too, so a scheme that fails still carries consequences. Abetting an offence carries the punishment provided for the offence itself, where the abetted act is committed and no express provision is made for the abetment. Attempting an offence, where no express provision is made for the attempt, carries imprisonment which may extend to one-half of the longest term provided for that offence, or the fine provided for it, or both.",
        citation: { sourceId: "it_act", unitNumber: "84B", label: "IT Act, Sections 84B and 84C" }
      }
    ],
    scopeNote:
      "This describes offences. It is not a guide to reporting a specific fraud to a bank, a platform or a cybercrime portal, and it does not address recovering money — for those, the relevant bank's grievance process and the official cybercrime reporting channels are the right starting points."
  },
  {
    slug: "privacy-basics",
    categoryId: "digital-rights",
    title: "Privacy in Electronic Form",
    summary:
      "The statutory privacy protections the Information Technology Act provides: offences for disclosure, for breach of a service contract, and for capturing private images.",
    paragraphs: [
      {
        text: "Unauthorised disclosure by someone acting under powers conferred by the Act is an offence. A person who, in pursuance of those powers, has secured access to any electronic record, book, register, correspondence, information, document or other material without the consent of the person concerned, and discloses it to another person, is punishable with imprisonment up to two years, or a fine up to one lakh rupees, or both.",
        citation: { sourceId: "it_act", unitNumber: "72", label: "IT Act, Section 72" }
      },
      {
        text: "Disclosure in breach of a service contract is treated separately and more severely. Any person — including an intermediary — who while providing services under a lawful contract has secured access to material containing personal information about another person, and discloses it without that person's consent or in breach of the contract, intending or knowing it likely to cause wrongful loss or wrongful gain, is punishable with imprisonment up to three years, or a fine up to five lakh rupees, or both.",
        citation: { sourceId: "it_act", unitNumber: "72", label: "IT Act, Section 72A" }
      },
      {
        text: "Images have their own provision. Intentionally or knowingly capturing, publishing or transmitting the image of a private area of any person without their consent, under circumstances violating that person's privacy, is punishable with imprisonment up to three years or a fine not exceeding two lakh rupees, or both.",
        citation: { sourceId: "it_act", unitNumber: "66E", label: "IT Act, Section 66E" }
      },
      {
        text: "That section defines its own terms carefully. “Capture” means to videotape, photograph, film or record by any means; “transmit” means to send a visual image electronically with the intent that it be viewed; and “publishes” means reproduction in printed or electronic form and making it available to the public.",
        citation: { sourceId: "it_act", unitNumber: "66E", label: "IT Act, Section 66E, Explanation (a)-(d)" }
      },
      {
        text: "The key phrase is defined by reasonable expectation rather than by location. “Under circumstances violating privacy” means circumstances in which a person can reasonably expect that they could disrobe in privacy without an image of a private area being captured, or that a private area would not be visible to the public — regardless of whether the person is in a public or a private place.",
        citation: { sourceId: "it_act", unitNumber: "66E", label: "IT Act, Section 66E, Explanation (e)" }
      },
      {
        text: "Intermediaries carry a retention duty on the other side of the same coin: an intermediary must preserve and retain such information as may be specified, for such duration and in such manner and format as the Central Government prescribes, and intentional or knowing contravention is punishable with imprisonment up to three years and a fine.",
        citation: { sourceId: "it_act", unitNumber: "67C", label: "IT Act, Section 67C" }
      }
    ],
    scopeNote:
      "This covers only the statutory privacy provisions present in this project's ingested source library. Section 43A, which provides compensation where a body corporate is negligent in protecting sensitive personal data, is listed in the Act but its text is not present in the ingested PDF, so it is not summarised here. Indian privacy law also rests on constitutional case law and on separate data-protection legislation, neither of which is part of the corpus."
  },
  {
    slug: "harmful-content-online",
    categoryId: "digital-rights",
    title: "Harmful Content Online",
    summary:
      "What the Information Technology Act makes an offence to publish or transmit electronically, and the special protection it gives to children.",
    paragraphs: [
      {
        text: "The general obscenity provision applies to electronic form. Publishing or transmitting, or causing to be published or transmitted, material in electronic form which is lascivious or appeals to the prurient interest, or whose effect tends to deprave and corrupt persons likely to see or hear it, is punishable on first conviction with imprisonment up to three years and a fine up to five lakh rupees, and on a second or subsequent conviction with imprisonment up to five years and a fine up to ten lakh rupees.",
        citation: { sourceId: "it_act", unitNumber: "67", label: "IT Act, Section 67" }
      },
      {
        text: "Sexually explicit material is treated more seriously. Publishing or transmitting material in electronic form containing a sexually explicit act or conduct is punishable on first conviction with imprisonment up to five years and a fine up to ten lakh rupees, and on a subsequent conviction with imprisonment up to seven years and a fine up to ten lakh rupees.",
        citation: { sourceId: "it_act", unitNumber: "67A", label: "IT Act, Section 67A" }
      },
      {
        text: "The provision on children is the widest of the three. It covers publishing or transmitting material depicting children in a sexually explicit act; creating, collecting, seeking, browsing, downloading, advertising, promoting, exchanging or distributing such material; cultivating, enticing or inducing children into an online relationship for a sexually explicit act; facilitating abusing children online; and recording one's own or another's abuse of a child. The punishment is imprisonment up to five years and a fine up to ten lakh rupees on first conviction, and up to seven years with the same fine on a subsequent conviction.",
        citation: { sourceId: "it_act", unitNumber: "67B", label: "IT Act, Section 67B" }
      },
      {
        text: "All three sections carry a narrow public-good exception, for material whose publication is proved to be justified as being for the public good on the ground that it is in the interest of science, literature, art or learning or other objects of general concern, and for material kept or used for bona fide heritage or religious purposes.",
        citation: { sourceId: "it_act", unitNumber: "67B", label: "IT Act, Section 67B, proviso" }
      },
      {
        text: "Separately from prosecution, the Act provides a blocking power. Where the Central Government or a specially authorised officer is satisfied that it is necessary in the interest of the sovereignty and integrity of India, defence, security of the State, friendly relations with foreign States, public order, or for preventing incitement to a cognizable offence relating to those, it may — for reasons recorded in writing — direct a government agency or an intermediary to block information for public access.",
        citation: { sourceId: "it_act", unitNumber: "69A", label: "IT Act, Section 69A(1)" }
      },
      {
        text: "That power is bounded by procedure and backed by a penalty. The procedure and safeguards subject to which blocking is carried out are to be prescribed, and an intermediary that fails to comply with a blocking direction is punishable with imprisonment which may extend to seven years and a fine.",
        citation: { sourceId: "it_act", unitNumber: "69A", label: "IT Act, Section 69A(2)-(3)" }
      }
    ],
    scopeNote:
      "Content offences involving children are also governed by legislation outside this project's ingested corpus, which is therefore not summarised here. Anyone who encounters material depicting the abuse of a child should report it to the police rather than act on a summary of the law."
  },
  {
    slug: "intermediaries-and-takedowns",
    categoryId: "digital-rights",
    title: "When Is a Platform Responsible?",
    summary:
      "The conditions on which an intermediary is protected from liability for what its users post, and the conditions on which that protection falls away.",
    paragraphs: [
      {
        text: "The starting position is protection. Notwithstanding anything in any other law, and subject to the conditions below, an intermediary is not liable for any third-party information, data or communication link made available or hosted by it.",
        citation: { sourceId: "it_act", unitNumber: "79", label: "IT Act, Section 79(1)" }
      },
      {
        text: "That protection is conditional on the intermediary staying passive. It applies where the intermediary's function is limited to providing access to a communication system over which third-party information is transmitted, temporarily stored or hosted; or where the intermediary does not initiate the transmission, select the receiver, or select or modify the information transmitted.",
        citation: { sourceId: "it_act", unitNumber: "79", label: "IT Act, Section 79(2)(a)-(b)" }
      },
      {
        text: "It is also conditional on diligence. The intermediary must observe due diligence while discharging its duties under the Act, and observe such other guidelines as the Central Government may prescribe.",
        citation: { sourceId: "it_act", unitNumber: "79", label: "IT Act, Section 79(2)(c)" }
      },
      {
        text: "The protection falls away in two situations. First, where the intermediary has conspired, abetted, aided or induced the commission of the unlawful act, whether by threats, promise or otherwise. Second, where on receiving actual knowledge, or on being notified by the appropriate Government or its agency, that material on a resource it controls is being used to commit an unlawful act, the intermediary fails to expeditiously remove or disable access to that material without vitiating the evidence.",
        citation: { sourceId: "it_act", unitNumber: "79", label: "IT Act, Section 79(3)" }
      },
      {
        text: "Alongside that, an intermediary must preserve and retain such information as may be specified, for such duration and in such manner and format as the Central Government prescribes; intentional or knowing contravention is punishable with imprisonment up to three years and a fine.",
        citation: { sourceId: "it_act", unitNumber: "67C", label: "IT Act, Section 67C" }
      },
      {
        text: "There is also a monitoring power distinct from blocking. The Central Government may authorise an agency to monitor and collect traffic data or information generated, transmitted, received or stored in any computer resource, to enhance cyber security and identify, analyse and prevent intrusion or the spread of computer contaminants.",
        citation: { sourceId: "it_act", unitNumber: "69B", label: "IT Act, Section 69B" }
      }
    ],
    scopeNote:
      "The \"due diligence\" guidelines referred to in section 79(2)(c) are made as separate rules by the Central Government. Those rules are not part of this project's ingested source library, so their specific requirements — including grievance-officer and takedown timelines — are not described here."
  },
  {
    slug: "electronic-records-and-signatures",
    categoryId: "digital-rights",
    title: "Electronic Records and Signatures",
    summary:
      "Why an email, a scanned form or a digitally signed document counts in law, and the rules that decide who sent an electronic record and when.",
    paragraphs: [
      {
        text: "The Act's foundational move is to make electronic form count. Where any law requires information or a matter to be in writing, typewritten or printed form, that requirement is deemed satisfied if the information is rendered or made available in electronic form and is accessible so as to be usable for subsequent reference.",
        citation: { sourceId: "it_act", unitNumber: "4", label: "IT Act, Section 4" }
      },
      {
        text: "Signatures work the same way. Where a law requires information to be authenticated by affixing a signature, or a document to be signed, that requirement is deemed satisfied if the information is authenticated by means of an electronic signature affixed in the manner prescribed by the Central Government.",
        citation: { sourceId: "it_act", unitNumber: "5", label: "IT Act, Section 5" }
      },
      {
        text: "The underlying technique is spelled out. A subscriber may authenticate an electronic record by affixing a digital signature, effected by the use of an asymmetric crypto system and a hash function that transform the record. Any person can verify the record using the subscriber's public key, and the private and public keys are unique to the subscriber and form a functioning key pair.",
        citation: { sourceId: "it_act", unitNumber: "3", label: "IT Act, Section 3" }
      },
      {
        text: "Government filings are expressly included. Where a law provides for filing a form or document with a government office, for issuing a licence, permit, sanction or approval, or for receiving or paying money in a particular manner, that requirement is deemed satisfied if it is done in the electronic form prescribed by the appropriate Government.",
        citation: { sourceId: "it_act", unitNumber: "6", label: "IT Act, Section 6" }
      },
      {
        text: "Retention rules follow. Where a law requires documents or information to be retained for a period, that is satisfied by retention in electronic form if the information remains accessible for subsequent reference, the record is kept in its original format or one that accurately represents it, and the details identifying the origin, destination, date and time of despatch or receipt are available.",
        citation: { sourceId: "it_act", unitNumber: "7", label: "IT Act, Section 7" }
      },
      {
        text: "Two practical rules decide disputes about who sent what, and when. An electronic record is attributed to the originator if it was sent by the originator, by a person authorised to act on the originator's behalf for that record, or by an information system programmed to operate automatically on the originator's behalf. Despatch occurs when the record enters a computer resource outside the originator's control, and receipt occurs, broadly, when it enters the addressee's designated computer resource — or, if none was designated, the addressee's computer resource.",
        citation: { sourceId: "it_act", unitNumber: "11", label: "IT Act, Sections 11 and 13" }
      }
    ]
  }
];
