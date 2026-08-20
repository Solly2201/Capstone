import type { Faq } from "../types";

// Legal aid, consumer problems, online harm and children. These are the
// "where do I go and what can I ask for?" questions -- the ones where the
// corpus supports a concrete, lawful next step rather than only a
// definition.
export const everydayServicesFaqs: Faq[] = [
  {
    id: "cannot-afford-a-lawyer",
    question: "I cannot afford a lawyer. How do I get one?",
    categoryId: "legal-aid",
    shortAnswer:
      "Free legal services are an entitlement, not a favour, for listed categories of people — including any woman or child, members of a Scheduled Caste or Scheduled Tribe, persons with disability, industrial workmen, persons in custody, and people below an income limit. Your District Legal Services Authority is the place to apply.",
    whatYouCanDo: [
      "Approach the District Legal Services Authority in your district — the District Judge chairs it and it exists for exactly this.",
      "If you qualify on income, an affidavit as to your income may be enough to establish eligibility.",
      "The Authority must also be satisfied you have a prima facie case to prosecute or defend."
    ],
    legalBasis: [
      {
        text: "Every person who has to file or defend a case is entitled to legal services if they are a member of a Scheduled Caste or Scheduled Tribe; a victim of trafficking or begar; a woman or a child; a person with disability; a person in circumstances of undeserved want such as a victim of mass disaster, ethnic violence, caste atrocity, flood, drought, earthquake or industrial disaster; an industrial workman; or a person in custody — and there is also an income criterion.",
        citation: { sourceId: "lsa", unitNumber: "12", label: "Legal Services Authorities Act, Section 12" }
      },
      {
        text: "Persons satisfying all or any of those criteria are entitled to receive legal services, provided the concerned Authority is satisfied that they have a prima facie case to prosecute or defend.",
        citation: { sourceId: "lsa", unitNumber: "13", label: "Legal Services Authorities Act, Section 13(1)" }
      },
      {
        text: "An affidavit made by a person as to their income may be regarded as sufficient to establish eligibility, unless the Authority has reason to disbelieve it.",
        citation: { sourceId: "lsa", unitNumber: "13", label: "Legal Services Authorities Act, Section 13(2)" }
      },
      {
        text: "A District Legal Services Authority is constituted for every district, chaired by the District Judge, to perform the State Authority's functions in that district and organise Lok Adalats there.",
        citation: { sourceId: "lsa", unitNumber: "9", label: "Legal Services Authorities Act, Sections 9 and 10" }
      }
    ],
    scopeNote:
      "The income limits in section 12(h) are set by government notification and have been revised since the Act was passed; the figures in the ingested text are the ones originally enacted. Check the current limit with your District Legal Services Authority rather than relying on a number quoted anywhere.",
    relatedArticles: ["free-legal-aid", "legal-services-authorities"],
    tags: ["free lawyer", "legal aid", "cannot afford", "poor", "nalsa", "dlsa", "advocate"]
  },
  {
    id: "what-is-a-lok-adalat",
    question: "Someone suggested a Lok Adalat. What is it, and what happens if I settle there?",
    categoryId: "legal-aid",
    shortAnswer:
      "A Lok Adalat is a settlement forum. If it settles your case, the award is treated as a decree of a civil court, the court fee you paid is refunded — and the award is final, with no appeal to any court.",
    whatYouCanDo: [
      "A case can go there if both parties agree, if one applies and the court sees a chance of settlement, or if the court thinks it appropriate — in each case after hearing the parties.",
      "A pre-litigation matter can also be referred on one party's application.",
      "If no settlement is reached, nothing is lost: a court-referred case goes back to the court and continues from where it was."
    ],
    legalBasis: [
      {
        text: "A court may refer a case to a Lok Adalat where the parties agree, where one party applies and the court is prima facie satisfied there are chances of settlement, or where the court is satisfied the matter is appropriate — in each case after giving the parties a reasonable opportunity of being heard.",
        citation: { sourceId: "lsa", unitNumber: "20", label: "Legal Services Authorities Act, Section 20(1)" }
      },
      {
        text: "Every award of a Lok Adalat is deemed to be a decree of a civil court, and where a compromise is arrived at in a referred case the court fee paid is refunded.",
        citation: { sourceId: "lsa", unitNumber: "21", label: "Legal Services Authorities Act, Section 21(1)" }
      },
      {
        text: "Every award is final and binding on all the parties, and no appeal lies to any court against it.",
        citation: { sourceId: "lsa", unitNumber: "21", label: "Legal Services Authorities Act, Section 21(2)" }
      },
      {
        text: "Where no award is made because no compromise could be reached, the record of a court-referred case is returned and the court proceeds from the stage reached before the reference.",
        citation: { sourceId: "lsa", unitNumber: "20", label: "Legal Services Authorities Act, Section 20(5) and (7)" }
      }
    ],
    scopeNote:
      "Because the award is final and cannot be appealed, agreeing to a settlement is a significant decision. Whether a particular settlement is a good one is a question for a lawyer or the Authority organising the Lok Adalat — not for this page.",
    relatedArticles: ["lok-adalats", "permanent-lok-adalats"],
    tags: ["lok adalat", "settlement", "compromise", "court fee refund", "settle case"]
  },
  {
    id: "shop-wont-refund",
    question: "A shop sold me something defective and won't refund me. What can I do?",
    categoryId: "consumer-rights",
    shortAnswer:
      "You can file a consumer complaint. A fault in goods is a defect and a fault in a service is a deficiency, and a District Consumer Disputes Redressal Commission can order a refund, a replacement, repair or compensation. You can file electronically, and generally close to home.",
    whatYouCanDo: [
      "File with the District Commission — where the value paid does not exceed one crore rupees.",
      "You may file where you reside or work for gain, not only where the seller is.",
      "The complaint may be filed electronically in the prescribed manner.",
      "Do it within two years of the cause of action."
    ],
    legalBasis: [
      {
        text: "A defect is any fault, imperfection or shortcoming in the quality, quantity, potency, purity or standard of goods; a deficiency is any fault, imperfection, shortcoming or inadequacy in the quality, nature and manner of performance of a service.",
        citation: { sourceId: "cpa2019", unitNumber: "2", label: "Consumer Protection Act, Sections 2(10)-(11)" }
      },
      {
        text: "A complaint about goods sold or a service provided may be filed with a District Commission by the consumer concerned, and may be filed electronically in the prescribed manner.",
        citation: { sourceId: "cpa2019", unitNumber: "35", label: "Consumer Protection Act, Section 35(1)" }
      },
      {
        text: "The District Commission entertains complaints where the value paid as consideration does not exceed one crore rupees, and a complaint may be instituted where the complainant resides or personally works for gain.",
        citation: { sourceId: "cpa2019", unitNumber: "34", label: "Consumer Protection Act, Section 34(1)-(2)" }
      },
      {
        text: "The Commission may order removal of the defect, replacement with goods free from defect, return of the price with interest, or compensation for loss or injury caused by negligence.",
        citation: { sourceId: "cpa2019", unitNumber: "39", label: "Consumer Protection Act, Section 39(1)" }
      }
    ],
    scopeNote:
      "Whether something is a defect or a deficiency is a judgement about facts that belongs to the Commission. This page does not assess your purchase or predict what you would be awarded.",
    relatedArticles: ["where-to-file-a-consumer-complaint", "how-a-consumer-case-proceeds", "consumer-rights-basics"],
    tags: ["refund", "defective", "shop won't return money", "faulty product", "consumer complaint", "warranty"]
  },
  {
    id: "consumer-time-limit",
    question: "How long do I have to file a consumer complaint?",
    categoryId: "consumer-rights",
    shortAnswer:
      "Two years from the date the cause of action arose. A later complaint can still be entertained, but only if you satisfy the Commission there was sufficient cause for the delay and it records its reasons.",
    legalBasis: [
      {
        text: "A District, State or National Commission shall not admit a complaint unless it is filed within two years from the date on which the cause of action has arisen.",
        citation: { sourceId: "cpa2019", unitNumber: "69", label: "Consumer Protection Act, Section 69(1)" }
      },
      {
        text: "A complaint may be entertained after that period if the complainant satisfies the Commission that there was sufficient cause for not filing it within time, and the Commission records its reasons for condoning the delay.",
        citation: { sourceId: "cpa2019", unitNumber: "69", label: "Consumer Protection Act, Section 69(2)" }
      }
    ],
    scopeNote:
      "When the cause of action arose is itself a legal question in some disputes. If you are near the limit, that is a reason to get advice quickly rather than to rely on a general page.",
    relatedArticles: ["where-to-file-a-consumer-complaint"],
    tags: ["time limit", "two years", "limitation", "too late", "deadline"]
  },
  {
    id: "trader-ignoring-order",
    question: "The Commission ordered the trader to pay me and they are ignoring it. What now?",
    categoryId: "consumer-rights",
    shortAnswer:
      "An order of a Consumer Commission is enforced as if it were a decree of a civil court, and not complying with it is a criminal offence carrying a minimum of one month's imprisonment or a minimum fine.",
    legalBasis: [
      {
        text: "Every order made by a District, State or National Commission is enforced by it in the same manner as if it were a decree made by a court in a suit before it.",
        citation: { sourceId: "cpa2019", unitNumber: "71", label: "Consumer Protection Act, Section 71" }
      },
      {
        text: "Whoever fails to comply with such an order is punishable with imprisonment of not less than one month and up to three years, or a fine of not less than twenty-five thousand rupees and up to one lakh rupees, or both; the Commission has the powers of a Judicial Magistrate of the first class for that trial.",
        citation: { sourceId: "cpa2019", unitNumber: "72", label: "Consumer Protection Act, Section 72" }
      }
    ],
    scopeNote:
      "Execution is a step you take before the Commission that made the order. This page does not draft or file that application.",
    relatedArticles: ["how-a-consumer-case-proceeds"],
    tags: ["not paying", "ignoring order", "execution", "enforce order", "commission order"]
  },
  {
    id: "account-hacked-identity-theft",
    question: "Someone used my password or pretended to be me online. Is that an offence?",
    categoryId: "digital-rights",
    shortAnswer:
      "Yes. Fraudulently using another person's electronic signature, password or unique identification feature is identity theft, and cheating by pretending to be someone else using a computer resource is a separate offence. If money was lost to a scam, report it on 1930 or at cybercrime.gov.in as quickly as you can.",
    whatYouCanDo: [
      "If money was lost, call 1930 (Cyber Fraud Helpline) or report at cybercrime.gov.in — reporting quickly matters for any chance of recovery.",
      "Report the offence to the police; an offence under the IT Act is investigated by an officer not below the rank of Inspector.",
      "Preserve whatever record exists — messages, transaction references, screenshots."
    ],
    legalBasis: [
      {
        text: "Whoever fraudulently or dishonestly makes use of the electronic signature, password or any other unique identification feature of another person is punishable with imprisonment up to three years and a fine up to one lakh rupees.",
        citation: { sourceId: "it_act", unitNumber: "66C", label: "IT Act, Section 66C" }
      },
      {
        text: "Whoever, by means of any communication device or computer resource, cheats by personation is punishable with imprisonment up to three years and a fine up to one lakh rupees.",
        citation: { sourceId: "it_act", unitNumber: "66D", label: "IT Act, Section 66D" }
      },
      {
        text: "An offence under the Act is to be investigated by a police officer not below the rank of Inspector.",
        citation: { sourceId: "it_act", unitNumber: "78", label: "IT Act, Section 78" }
      }
    ],
    scopeNote:
      "This page explains the offences. It cannot help you recover money, deal with your bank, or get an account restored — the cyber helpline, the platform and your bank's grievance process handle those.",
    relatedArticles: ["identity-theft-and-impersonation", "cybercrime-and-online-fraud"],
    tags: ["hacked", "identity theft", "fake profile", "otp", "scam", "password stolen", "impersonation"]
  },
  {
    id: "private-images-shared",
    question: "Someone shared a private photo or video of me without my consent. What does the law say?",
    categoryId: "digital-rights",
    shortAnswer:
      "Capturing, publishing or transmitting an image of a person's private area without consent, in circumstances violating their privacy, is an offence — and it applies whether the person was in a public or a private place. Publishing obscene or sexually explicit material electronically is separately punishable.",
    whatYouCanDo: [
      "Report it to the police; it is an offence, not a private matter.",
      "You can also report online harm at cybercrime.gov.in.",
      "An intermediary that is notified by the appropriate Government or its agency about unlawful material, and fails to remove it expeditiously, loses its protection from liability."
    ],
    legalBasis: [
      {
        text: "Intentionally or knowingly capturing, publishing or transmitting the image of a private area of any person without their consent, under circumstances violating that person's privacy, is punishable with imprisonment up to three years or a fine not exceeding two lakh rupees, or both.",
        citation: { sourceId: "it_act", unitNumber: "66E", label: "IT Act, Section 66E" }
      },
      {
        text: "Circumstances violating privacy means circumstances in which a person could reasonably expect privacy — regardless of whether they are in a public or a private place.",
        citation: { sourceId: "it_act", unitNumber: "66E", label: "IT Act, Section 66E, Explanation (e)" }
      },
      {
        text: "Publishing or transmitting obscene material in electronic form, and material containing a sexually explicit act, are separately punishable offences.",
        citation: { sourceId: "it_act", unitNumber: "67", label: "IT Act, Sections 67 and 67A" }
      },
      {
        text: "An intermediary loses its exemption from liability where, on receiving actual knowledge or being notified by the appropriate Government or its agency, it fails to expeditiously remove or disable access to unlawful material.",
        citation: { sourceId: "it_act", unitNumber: "79", label: "IT Act, Section 79(3)(b)" }
      }
    ],
    scopeNote:
      "Where the person depicted is a child, separate and more serious law applies, including legislation this project has not ingested. If a child is involved, contact the police or Childline on 1098 rather than relying on this page.",
    relatedArticles: ["privacy-basics", "harmful-content-online", "intermediaries-and-takedowns"],
    tags: ["private photo", "leaked", "morphed", "revenge", "obscene", "take down", "nude"],
    urgency: "serious"
  },
  {
    id: "child-picked-up-by-police",
    question: "The police have picked up my child. What does the law require?",
    categoryId: "children-and-young-people",
    shortAnswer:
      "A child alleged to be in conflict with law must be placed with the special juvenile police unit or child welfare police officer and produced before the Juvenile Justice Board within twenty-four hours — and in no case may a child be put in a police lock-up or jail. Bail is the rule, whatever the offence.",
    whatYouCanDo: [
      "Ask for the special juvenile police unit or the designated child welfare police officer.",
      "The child must be produced before the Juvenile Justice Board within twenty-four hours, excluding travel.",
      "Ask about bail — a child is to be released on bail whether the alleged offence is bailable or not, unless the Board records specific reasons.",
      "The Board must ensure legal aid is available to the child through the legal services institutions."
    ],
    legalBasis: [
      {
        text: "A child apprehended by the police must be placed under the charge of the special juvenile police unit or the designated child welfare police officer and produced before the Board within twenty-four hours, excluding journey time; in no case may a child alleged to be in conflict with law be placed in a police lock-up or lodged in a jail.",
        citation: { sourceId: "jj2015", unitNumber: "10", label: "Juvenile Justice Act, Section 10(1)" }
      },
      {
        text: "A person who is apparently a child, alleged to have committed a bailable or non-bailable offence, shall be released on bail with or without surety, or placed under supervision — release may be refused only on recorded reasons, and even then the child goes to an observation home or place of safety, not custody.",
        citation: { sourceId: "jj2015", unitNumber: "12", label: "Juvenile Justice Act, Section 12" }
      },
      {
        text: "The Board must ensure the informed participation of the child and the parent or guardian at every step, that the child's rights are protected throughout, and that legal aid is available through the legal services institutions.",
        citation: { sourceId: "jj2015", unitNumber: "8", label: "Juvenile Justice Act, Section 8(3)" }
      },
      {
        text: "No report may disclose the name, address, school or any other particular that could identify a child in conflict with law, and contravention is punishable.",
        citation: { sourceId: "jj2015", unitNumber: "74", label: "Juvenile Justice Act, Section 74" }
      }
    ],
    scopeNote:
      "How a particular matter proceeds — including whether a preliminary assessment is ordered for an older child alleged to have committed a heinous offence — is decided by the Board on its facts. Legal aid is available and should be used.",
    relatedArticles: ["juvenile-justice-board", "principles-of-juvenile-justice", "free-legal-aid"],
    tags: ["child arrested", "my son picked up", "juvenile", "minor", "police took my kid", "under 18"],
    urgency: "serious"
  },
  {
    id: "child-needs-care",
    question: "I have found a child who seems abandoned or lost. What should I do?",
    categoryId: "children-and-young-people",
    shortAnswer:
      "Reporting is not optional — anyone who finds or takes charge of a child who appears abandoned, lost or orphaned must inform Childline, the nearest police station, a Child Welfare Committee or the District Child Protection Unit within twenty-four hours, or hand the child to a registered child care institution.",
    whatYouCanDo: [
      "Report within twenty-four hours to Childline (1098), the nearest police station, a Child Welfare Committee or the District Child Protection Unit.",
      "Alternatively, hand the child over to a child care institution registered under the Act.",
      "Any citizen may produce a child in need of care and protection before the Committee — you do not need to be an official."
    ],
    legalBasis: [
      {
        text: "Any individual, police officer or functionary of an organisation, nursing home, hospital or maternity home who finds, takes charge of, or is handed a child who appears or claims to be abandoned or lost, or an orphan without family support, must within twenty-four hours give information to Childline Services, the nearest police station, a Child Welfare Committee or the District Child Protection Unit — or hand the child to a registered child care institution.",
        citation: { sourceId: "jj2015", unitNumber: "32", label: "Juvenile Justice Act, Section 32(1)" }
      },
      {
        text: "A child in need of care and protection may be produced before the Committee by a wide list of persons including any social worker or public-spirited citizen, a doctor, or the child themselves — and must be produced without loss of time and within twenty-four hours.",
        citation: { sourceId: "jj2015", unitNumber: "31", label: "Juvenile Justice Act, Section 31(1)" }
      },
      {
        text: "The Committee's functions include conducting inquiry into the child's safety and well-being, directing placement in foster care, and ensuring care, protection, rehabilitation or restoration based on the child's individual care plan.",
        citation: { sourceId: "jj2015", unitNumber: "30", label: "Juvenile Justice Act, Section 30" }
      }
    ],
    scopeNote:
      "If the child appears to be in immediate danger, contact 112 or Childline on 1098 first. This page explains the reporting duty, not what will happen to the child afterwards — that is for the Committee to decide.",
    relatedArticles: ["children-in-need-of-care", "offences-against-children"],
    tags: ["abandoned child", "lost child", "orphan", "childline", "1098", "found a child"],
    urgency: "serious"
  }
];
