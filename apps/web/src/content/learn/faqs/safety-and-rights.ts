import type { Faq } from "../types";

// Situations where someone may be in danger or in live legal jeopardy.
// Every FAQ here is marked `urgency`, so the page leads with getting help
// rather than with the law. Only official national helplines are named --
// 112 (Emergency), 181 (Women's Helpline), 1098 (Childline) and 1930
// (Cyber Fraud) -- matching the numbers the Legal Assistant's safety layer
// is allowed to give. No number is invented and no local number guessed.
export const safetyAndRightsFaqs: Faq[] = [
  {
    id: "someone-is-threatening-me",
    question: "Someone is threatening me. What can I do?",
    categoryId: "everyday-rights",
    shortAnswer:
      "If the threat is immediate, contact the police on 112 first — the law comes second when someone is in danger. Threatening a person with injury to their body, reputation or property in order to alarm them or force them to act is criminal intimidation, and it is an offence.",
    whatYouCanDo: [
      "If you are in immediate danger, call 112 and get somewhere safe.",
      "Report it at a police station — information about a cognizable offence must be recorded whatever area it happened in, and you get a free copy.",
      "Keep whatever record exists of the threats.",
      "If the threat comes with a demand for money or property, that is a different and more serious offence — say so when you report it."
    ],
    legalBasis: [
      {
        text: "Whoever threatens another with injury to their person, reputation or property — or to a person they are interested in — with intent to cause alarm, or to make them do something they are not legally bound to do, commits criminal intimidation. It is punishable with imprisonment up to two years, or a fine, or both, and more severely where the threat is to cause death or grievous hurt.",
        citation: { sourceId: "bns", unitNumber: "351", label: "BNS, Section 351" }
      },
      {
        text: "Where the threat is used to dishonestly induce a person to deliver property, the offence is extortion rather than intimidation alone.",
        citation: { sourceId: "bns", unitNumber: "308", label: "BNS, Section 308" }
      },
      {
        text: "Information about a cognizable offence may be given orally or by electronic communication, irrespective of the area where the offence was committed, and a free copy of the record is given to the informant.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)-(2)" }
      }
    ],
    scopeNote:
      "This is general information about offences, not a safety plan and not advice about your situation. If you are afraid for your safety, contacting the police and a lawyer matters more than which section applies.",
    relatedArticles: ["threats-insults-and-reputation", "how-to-file-an-fir"],
    tags: ["threat", "threatening me", "intimidation", "scared", "extortion", "blackmail"],
    urgency: "emergency"
  },
  {
    id: "being-followed-or-stalked",
    question: "A man keeps following and contacting me after I told him to stop. Is that an offence?",
    categoryId: "everyday-rights",
    shortAnswer:
      "Yes. Following a woman and repeatedly contacting or attempting to contact her despite a clear indication of disinterest is the offence of stalking, and so is monitoring her use of the internet or electronic communication. If you feel unsafe now, call 112.",
    whatYouCanDo: [
      "If you feel in danger, call 112 or the Women's Helpline on 181.",
      "Report it — stalking is an offence, not a private matter.",
      "Keep whatever record exists of the contact, including electronic messages."
    ],
    legalBasis: [
      {
        text: "Any man who follows a woman and contacts, or attempts to contact, her to foster personal interaction repeatedly despite a clear indication of disinterest, or who monitors her use of the internet, email or any other form of electronic communication, commits the offence of stalking. It is punishable on first conviction with imprisonment up to three years and a fine.",
        citation: { sourceId: "bns", unitNumber: "78", label: "BNS, Section 78" }
      },
      {
        text: "Where the conduct is by a person in a domestic relationship, the Protection of Women from Domestic Violence Act also allows a Magistrate to prohibit the respondent from attempting to communicate with the aggrieved person in any form.",
        citation: { sourceId: "pwdva", unitNumber: "18", label: "Protection of Women from Domestic Violence Act, Section 18(d)" }
      }
    ],
    scopeNote:
      "The stalking provision is drawn in terms of a man following a woman. Harassment in other situations may be an offence under different provisions, which this page does not set out.",
    relatedArticles: ["threats-insults-and-reputation", "orders-a-magistrate-can-pass"],
    tags: ["stalking", "following me", "harassment", "keeps calling", "won't leave me alone"],
    urgency: "serious"
  },
  {
    id: "violence-at-home",
    question: "Someone at home is hurting, threatening or controlling me. What can I do?",
    categoryId: "women-and-safety",
    shortAnswer:
      "If you are in danger now, call 112 or the Women's Helpline on 181 and get somewhere safe. The Protection of Women from Domestic Violence Act covers physical, sexual, verbal, emotional and economic abuse, and lets a Magistrate make orders to protect you — including orders about the home you live in.",
    whatYouCanDo: [
      "If you are in immediate danger, call 112 or 181 and move somewhere safe.",
      "Anyone — not only you — may give information about domestic violence to a Protection Officer, and doing so in good faith carries no liability.",
      "A police officer, Protection Officer, service provider or Magistrate who receives your complaint must tell you about the orders you can apply for, about shelter and medical help, and about your right to free legal services.",
      "An application for protection, residence, monetary relief, custody or compensation orders can be made to a Magistrate — by you, by a Protection Officer, or by someone on your behalf."
    ],
    legalBasis: [
      {
        text: "Domestic violence covers any act that harms or endangers the health, safety, life, limb or well-being — mental or physical — of the aggrieved person, and expressly includes physical abuse, sexual abuse, verbal and emotional abuse, and economic abuse such as depriving her of resources she is entitled to.",
        citation: { sourceId: "pwdva", unitNumber: "3", label: "Protection of Women from Domestic Violence Act, Section 3" }
      },
      {
        text: "Any person who has reason to believe an act of domestic violence has been, is being, or is likely to be committed may give information to the concerned Protection Officer, and incurs no civil or criminal liability for doing so in good faith.",
        citation: { sourceId: "pwdva", unitNumber: "4", label: "Protection of Women from Domestic Violence Act, Section 4" }
      },
      {
        text: "A police officer, Protection Officer, service provider or Magistrate who receives a complaint must inform the aggrieved person of her right to apply for protection, residence, monetary relief, custody and compensation orders, of the availability of service providers and shelter, and of her right to free legal services under the Legal Services Authorities Act, 1987.",
        citation: { sourceId: "pwdva", unitNumber: "5", label: "Protection of Women from Domestic Violence Act, Section 5" }
      },
      {
        text: "Every woman in a domestic relationship has the right to reside in the shared household whether or not she has any right, title or beneficial interest in it, and may not be evicted except in accordance with the procedure established by law.",
        citation: { sourceId: "pwdva", unitNumber: "17", label: "Protection of Women from Domestic Violence Act, Section 17" }
      }
    ],
    scopeNote:
      "This explains what the law provides. It is not a safety plan and cannot advise on your situation. Getting to safety and speaking to a Protection Officer, the police or a legal services authority comes first.",
    relatedArticles: ["what-is-domestic-violence", "protection-officers-and-first-response", "orders-a-magistrate-can-pass"],
    tags: ["domestic violence", "husband hits me", "abuse at home", "in-laws", "controlling my money", "dowry"],
    urgency: "emergency"
  },
  {
    id: "protection-order-breached",
    question: "The court ordered him to stay away, but he came back. What now?",
    categoryId: "women-and-safety",
    shortAnswer:
      "Breaching a protection order is itself an offence, and it is cognizable and non-bailable. If he is there now and you are in danger, call 112 or 181.",
    whatYouCanDo: [
      "If you are in danger right now, call 112 or the Women's Helpline on 181.",
      "Report the breach — as far as practicable it is tried by the same Magistrate who made the order.",
      "Your own testimony can be enough: the court may conclude an offence was committed on the sole testimony of the aggrieved person."
    ],
    legalBasis: [
      {
        text: "A breach of a protection order, or of an interim protection order, by the respondent is an offence punishable with imprisonment which may extend to one year, or a fine which may extend to twenty thousand rupees, or both.",
        citation: { sourceId: "pwdva", unitNumber: "31", label: "Protection of Women from Domestic Violence Act, Section 31(1)" }
      },
      {
        text: "That offence is cognizable and non-bailable, and upon the sole testimony of the aggrieved person the court may conclude that it has been committed.",
        citation: { sourceId: "pwdva", unitNumber: "32", label: "Protection of Women from Domestic Violence Act, Section 32" }
      },
      {
        text: "As far as practicable the offence is tried by the Magistrate who passed the order alleged to have been breached.",
        citation: { sourceId: "pwdva", unitNumber: "31", label: "Protection of Women from Domestic Violence Act, Section 31(2)" }
      }
    ],
    scopeNote:
      "This describes the remedy the Act provides. It is not a substitute for immediate help if you are unsafe, and it cannot advise on your case.",
    relatedArticles: ["breach-of-a-protection-order", "orders-a-magistrate-can-pass"],
    tags: ["protection order", "breach", "came back", "restraining order", "violated order"],
    urgency: "emergency"
  },
  {
    id: "thrown-out-of-home",
    question: "I have been thrown out of the house I live in. Can the law help?",
    categoryId: "women-and-safety",
    shortAnswer:
      "A woman in a domestic relationship has the right to reside in the shared household regardless of whether she owns it, and a Magistrate can make a residence order — including restraining the respondent from dispossessing her, or directing him to leave.",
    whatYouCanDo: [
      "An application for a residence order can be made to the Magistrate, by you or on your behalf.",
      "The Magistrate can order alternate accommodation of the same level, or rent for it, where circumstances require.",
      "Interim and ex parte orders are possible before the other side is heard."
    ],
    legalBasis: [
      {
        text: "Every woman in a domestic relationship has the right to reside in the shared household, whether or not she has any right, title or beneficial interest in it, and shall not be evicted or excluded except in accordance with the procedure established by law.",
        citation: { sourceId: "pwdva", unitNumber: "17", label: "Protection of Women from Domestic Violence Act, Section 17" }
      },
      {
        text: "A residence order may restrain the respondent from dispossessing or disturbing her possession of the shared household, direct him to remove himself from it, restrain him or his relatives from entering the portion she occupies, or direct him to secure alternate accommodation of the same level or pay rent for it. An order directing removal cannot be passed against a woman.",
        citation: { sourceId: "pwdva", unitNumber: "19", label: "Protection of Women from Domestic Violence Act, Section 19(1)" }
      },
      {
        text: "The Magistrate may pass an interim order as is just and proper, and may grant an ex parte order on the aggrieved person's affidavit where the application prima facie discloses domestic violence or a likelihood of it.",
        citation: { sourceId: "pwdva", unitNumber: "23", label: "Protection of Women from Domestic Violence Act, Section 23" }
      }
    ],
    scopeNote:
      "The Act's residence provisions apply to a woman in a domestic relationship as it defines that term. Housing and tenancy disputes outside that relationship are governed by laws this project has not ingested, and are not covered here.",
    relatedArticles: ["orders-a-magistrate-can-pass", "what-is-domestic-violence"],
    tags: ["thrown out", "kicked out of house", "shared household", "residence order", "nowhere to live"],
    urgency: "serious"
  },
  {
    id: "can-i-defend-myself",
    question: "Can I defend myself if someone attacks me?",
    categoryId: "everyday-rights",
    shortAnswer:
      "The law recognises a right of private defence of your body and of property — but it is bounded. There is no right of private defence where there is time to have recourse to the protection of the public authorities, and it never extends to inflicting more harm than is necessary.",
    legalBasis: [
      {
        text: "Every person has a right, subject to the restrictions in section 37, to defend their own body and the body of any other person against an offence affecting the human body, and property against theft, robbery, mischief or criminal trespass, or an attempt at those.",
        citation: { sourceId: "bns", unitNumber: "35", label: "BNS, Section 35" }
      },
      {
        text: "There is no right of private defence in cases in which there is time to have recourse to the protection of the public authorities, and the right in no case extends to the inflicting of more harm than it is necessary to inflict for the purpose of defence.",
        citation: { sourceId: "bns", unitNumber: "37", label: "BNS, Section 37(1)(c) and (2)" }
      }
    ],
    scopeNote:
      "This is the most important limitation on this page: whether force was justified is decided by a court afterwards, on the facts, and the law itself says to go to the authorities where there is time. Nothing here authorises the use of force, and it is not advice about any situation you are in. If you are in danger, call 112.",
    relatedArticles: ["threats-insults-and-reputation"],
    tags: ["self defence", "hit back", "private defence", "attacked", "protect myself"],
    urgency: "serious"
  },
  {
    id: "victim-compensation",
    question: "I was the victim of a crime. Is any compensation available?",
    categoryId: "everyday-rights",
    shortAnswer:
      "Every State, with the Centre, has to prepare a victim compensation scheme, and the quantum is decided by the State or District Legal Services Authority. If the offender was never traced and no trial took place, you can apply to that Authority directly.",
    whatYouCanDo: [
      "Approach the District or State Legal Services Authority — they decide the amount under the scheme.",
      "Where the offender was not traced or identified and no trial happened, an application can be made to that Authority by the victim or their dependants.",
      "A court can also recommend compensation where it finds what was awarded is not adequate for rehabilitation, or where the case ended in acquittal or discharge."
    ],
    legalBasis: [
      {
        text: "Every State Government, in coordination with the Central Government, shall prepare a scheme for providing funds for compensation to a victim or their dependants who have suffered loss or injury as a result of the crime and who require rehabilitation.",
        citation: { sourceId: "bnss", unitNumber: "396", label: "BNSS, Section 396(1)" }
      },
      {
        text: "Where a recommendation for compensation is made by the Court, the District or State Legal Services Authority decides the quantum awarded under the scheme.",
        citation: { sourceId: "bnss", unitNumber: "396", label: "BNSS, Section 396(2)" }
      },
      {
        text: "Where the offender is not traced or identified but the victim is, and no trial takes place, the victim or their dependants may apply to the State or District Legal Services Authority for an award of compensation.",
        citation: { sourceId: "bnss", unitNumber: "396", label: "BNSS, Section 396(4)" }
      }
    ],
    scopeNote:
      "The amounts and the detailed procedure come from each State's scheme, which is not part of this project's source library. Your District Legal Services Authority is the body that can tell you what applies where you live.",
    relatedArticles: ["free-legal-aid", "legal-services-authorities"],
    tags: ["victim compensation", "compensation", "injured", "crime victim", "money for victims"]
  }
];
