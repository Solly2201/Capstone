import type { Faq } from "../types";

/**
 * "What should I do?" questions about getting information from a public
 * authority.
 *
 * These answer the practical situation; the articles in the
 * right-to-information category explain the law. No FAQ repeats an
 * article -- each answers briefly and links onward.
 *
 * No fee amount appears anywhere here. The Act says only "such fee as
 * may be prescribed", and the figures live in rules that are not part of
 * this project's source library.
 */
export const informationAndRecordsFaqs: Faq[] = [
  {
    id: "how-do-i-ask-a-government-office-for-information",
    question: "How do I ask a government office for information it holds?",
    categoryId: "right-to-information",
    shortAnswer:
      "Put the request in writing or send it electronically to that office's Public Information Officer, in English, Hindi or the official language of your area. You do not have to say why you want it.",
    whatYouCanDo: [
      "Write to the Public Information Officer of the public authority that holds the record, specifying exactly what you want.",
      "Use English, Hindi, or the official language of the area where you are applying.",
      "Give contact details, but no reason — the Act does not require one.",
      "If you cannot write the request yourself, ask the officer to help put your oral request into writing; the Act requires that assistance.",
      "If you have sent it to the wrong office, it should be transferred rather than rejected."
    ],
    legalBasis: [
      {
        text: "A request is made in writing or through electronic means, in English or Hindi or the official language of the area, with the prescribed fee, to the Central or State Public Information Officer of the public authority concerned. Where a request cannot be made in writing, the officer must render all reasonable assistance to reduce it to writing.",
        citation: { sourceId: "rti", unitNumber: "6", label: "Right to Information Act, 2005, Section 6" }
      },
      {
        text: "The applicant is not required to give any reason for requesting the information, or any personal details beyond those necessary to contact them.",
        citation: { sourceId: "rti", unitNumber: "6", label: "Right to Information Act, 2005, Section 6" }
      },
      {
        text: "Where the information is held by another public authority, the office that received the application must transfer it and inform the applicant, in no case later than five days.",
        citation: { sourceId: "rti", unitNumber: "6", label: "Right to Information Act, 2005, Section 6" }
      }
    ],
    scopeNote:
      "This does not tell you what fee applies. The Act says only \"such fee as may be prescribed\", and the amounts are set by rules that are not part of this project's source library.",
    relatedArticles: ["how-to-make-an-rti-request", "what-is-the-right-to-information"],
    tags: [
      "rti",
      "right to information",
      "government information",
      "government file",
      "public information officer",
      "pio",
      "get records",
      "apply for information",
      "sarkari file",
      "government records"
    ]
  },
  {
    id: "how-long-before-the-office-must-reply",
    question: "How long does the office have to reply to my request?",
    categoryId: "right-to-information",
    shortAnswer:
      "Thirty days at the outside. If the information concerns someone's life or liberty, forty-eight hours. If they miss the deadline, the information must be given to you free.",
    whatYouCanDo: [
      "Count thirty days from when the office received your request.",
      "If what you asked for concerns a person's life or liberty, say so clearly — that request carries a forty-eight-hour limit.",
      "If the deadline passes with no reply, treat it as a refusal; that is what lets you appeal rather than keep waiting.",
      "If they reply late and ask for a fee, point out that late information is to be provided free of charge."
    ],
    legalBasis: [
      {
        text: "The Public Information Officer must act as expeditiously as possible and in any case within thirty days of receiving the request, either providing the information on payment of the prescribed fee or rejecting it for a reason specified in sections 8 or 9.",
        citation: { sourceId: "rti", unitNumber: "7", label: "Right to Information Act, 2005, Section 7" }
      },
      {
        text: "Where the information sought concerns the life or liberty of a person, it must be provided within forty-eight hours of the receipt of the request.",
        citation: { sourceId: "rti", unitNumber: "7", label: "Right to Information Act, 2005, Section 7" }
      },
      {
        text: "Failure to give a decision within the specified period means the officer is deemed to have refused the request.",
        citation: { sourceId: "rti", unitNumber: "7", label: "Right to Information Act, 2005, Section 7" }
      },
      {
        text: "Where a public authority fails to comply with the time limits in section 7(1), the person who made the request must be provided the information free of charge.",
        citation: { sourceId: "rti", unitNumber: "7", label: "Right to Information Act, 2005, Section 7" }
      }
    ],
    scopeNote:
      "These are the limits the Act sets. It does not guarantee that any particular office will meet them, and this does not tell you how a delay in your own case will be treated.",
    relatedArticles: ["how-long-an-rti-reply-takes", "appealing-an-rti-refusal"],
    tags: [
      "thirty days",
      "30 days",
      "no reply",
      "how long",
      "deadline",
      "time limit",
      "late reply",
      "48 hours",
      "life or liberty",
      "office not responding"
    ]
  },
  {
    id: "the-officer-has-not-replied-to-my-request",
    question: "The officer has not replied at all. What now?",
    categoryId: "right-to-information",
    shortAnswer:
      "Silence counts as a refusal once the time limit passes, so you do not have to keep waiting. You can appeal within thirty days to an officer senior to the one who ignored you.",
    whatYouCanDo: [
      "Work out the date the time limit expired — that is the date the refusal is deemed to have happened.",
      "File a first appeal within thirty days of that date, addressed to an officer senior in rank to the Public Information Officer in the same public authority.",
      "If you are late, explain why: a late appeal can be admitted where there was sufficient cause.",
      "If the first appeal also goes nowhere, a second appeal lies to the Information Commission within ninety days."
    ],
    legalBasis: [
      {
        text: "If the officer fails to give a decision on the request within the period specified, the officer is deemed to have refused the request.",
        citation: { sourceId: "rti", unitNumber: "7", label: "Right to Information Act, 2005, Section 7" }
      },
      {
        text: "A person who does not receive a decision within the time specified, or who is aggrieved by a decision, may appeal within thirty days to an officer senior in rank to the Public Information Officer in each public authority. A late appeal may be admitted where the appellant was prevented by sufficient cause from filing in time.",
        citation: { sourceId: "rti", unitNumber: "19", label: "Right to Information Act, 2005, Section 19" }
      },
      {
        text: "A second appeal lies within ninety days to the Central Information Commission or the State Information Commission.",
        citation: { sourceId: "rti", unitNumber: "19", label: "Right to Information Act, 2005, Section 19" }
      }
    ],
    scopeNote:
      "This describes the route the Act provides. It does not predict whether your appeal will succeed, and it is not advice about your particular case.",
    relatedArticles: ["appealing-an-rti-refusal", "how-long-an-rti-reply-takes"],
    tags: [
      "no response",
      "not replied",
      "ignored my application",
      "deemed refusal",
      "appeal",
      "first appeal",
      "second appeal",
      "information commission",
      "officer did not respond"
    ]
  },
  {
    id: "my-request-for-information-was-refused",
    question: "My request was refused. Can they do that?",
    categoryId: "right-to-information",
    shortAnswer:
      "Only on the grounds the Act lists, and a refusal must be a real one — an exempt paragraph does not make a whole file secret. You can appeal a refusal you think is wrong.",
    whatYouCanDo: [
      "Read the reason given and check it against the grounds the Act actually lists.",
      "If only part of the record is exempt, ask for the rest: severable non-exempt material may still be released, and you are entitled to a notice explaining a partial release.",
      "For commercial-confidence or fiduciary refusals, note that a larger public interest can outweigh them.",
      "Appeal within thirty days to an officer senior to the one who refused you."
    ],
    legalBasis: [
      {
        text: "Section 8 lists the grounds on which there is no obligation to give information, including disclosure that would prejudicially affect national security or sovereignty, breach parliamentary privilege, endanger a person's life or physical safety, or impede an investigation or prosecution.",
        citation: { sourceId: "rti", unitNumber: "8", label: "Right to Information Act, 2005, Section 8" }
      },
      {
        text: "Commercial confidence, trade secrets and intellectual property, and information held in a fiduciary relationship, may still be disclosed where the competent authority is satisfied that a larger public interest warrants it.",
        citation: { sourceId: "rti", unitNumber: "8", label: "Right to Information Act, 2005, Section 8" }
      },
      {
        text: "Where information is refused as exempt, access may still be given to the part of the record that is not exempt and can reasonably be severed, and the applicant must be given notice that only part is being provided.",
        citation: { sourceId: "rti", unitNumber: "10", label: "Right to Information Act, 2005, Section 10" }
      },
      {
        text: "A person aggrieved by a decision of the Public Information Officer may appeal within thirty days to an officer senior in rank within the same public authority.",
        citation: { sourceId: "rti", unitNumber: "19", label: "Right to Information Act, 2005, Section 19" }
      }
    ],
    scopeNote:
      "Whether a particular refusal was correctly made on one of these grounds is for the appellate authority or the Information Commission to decide. This cannot tell you whether the refusal in your case was lawful.",
    relatedArticles: [
      "information-that-can-be-refused",
      "partial-access-and-third-party-information",
      "appealing-an-rti-refusal"
    ],
    tags: [
      "refused",
      "rejected",
      "denied information",
      "exemption",
      "cannot give information",
      "part of file",
      "public interest",
      "why was my request rejected"
    ]
  },
  {
    id: "can-an-information-officer-be-penalised",
    question: "Can the officer be penalised for not giving me information?",
    categoryId: "right-to-information",
    shortAnswer:
      "Yes. The Information Commission can impose a penalty of Rs 250 a day, up to Rs 25,000, on the Public Information Officer personally — and the officer has to prove they acted reasonably.",
    whatYouCanDo: [
      "Raise it in your appeal or complaint: the penalty is decided by the Commission when it decides a complaint or an appeal, not in a separate proceeding you have to start.",
      "If you could not file a request at all — no officer was appointed, or the assistant refused to accept your application — that is a complaint to the Commission under section 18 rather than an appeal.",
      "Set out what happened factually: refusing to receive an application, missing the time limit, giving knowingly incorrect or misleading information, destroying the record, or obstructing its supply are the listed triggers."
    ],
    legalBasis: [
      {
        text: "Where the Commission, deciding a complaint or appeal, finds that the Public Information Officer without reasonable cause refused to receive an application, did not furnish information within the time specified, malafidely denied the request, knowingly gave incorrect, incomplete or misleading information, destroyed information that was the subject of the request, or obstructed its furnishing, it shall impose a penalty of two hundred and fifty rupees each day until the application is received or the information furnished, subject to a total not exceeding twenty-five thousand rupees.",
        citation: { sourceId: "rti", unitNumber: "20", label: "Right to Information Act, 2005, Section 20" }
      },
      {
        text: "The officer must be given a reasonable opportunity of being heard before a penalty is imposed, and the burden of proving that he or she acted reasonably and diligently lies on the officer.",
        citation: { sourceId: "rti", unitNumber: "20", label: "Right to Information Act, 2005, Section 20" }
      },
      {
        text: "It is the duty of the Information Commission to receive and inquire into a complaint from a person who was unable to submit a request at all, because no Public Information Officer was appointed or because the assistant officer refused to accept the application or appeal for forwarding.",
        citation: { sourceId: "rti", unitNumber: "18", label: "Right to Information Act, 2005, Section 18" }
      }
    ],
    scopeNote:
      "Whether a penalty is imposed in any particular case is entirely for the Information Commission to decide. Nothing here promises an outcome.",
    relatedArticles: ["complaints-and-penalties-under-rti", "appealing-an-rti-refusal"],
    tags: [
      "penalty",
      "fine the officer",
      "action against officer",
      "complaint",
      "information commission",
      "pio penalty",
      "officer punished",
      "250 per day"
    ]
  }
];
