import type { LearningArticle } from "./types";

export const policeFirArticles: LearningArticle[] = [
  {
    slug: "cognizable-vs-non-cognizable",
    categoryId: "police-fir",
    title: "Cognizable vs Non-Cognizable Offences",
    summary:
      "Whether police can arrest you without a warrant depends on which category the offence falls into.",
    paragraphs: [
      {
        text: "Indian criminal law sorts offences into two categories, and the difference changes what police can do the moment a complaint is made. A cognizable offence is one where a police officer may arrest without a warrant and start investigating without needing a magistrate's permission first. These are generally the more serious offences — things like assault causing serious injury, robbery, or offences carrying longer prison terms.",
        citation: { sourceId: "bnss", unitNumber: "2", label: "BNSS, Section 2(1)(g)" }
      },
      {
        text: "A non-cognizable offence is the opposite: police have no authority to arrest without a warrant, and they cannot investigate on their own initiative — they need a magistrate's order first. These tend to be less serious matters, such as minor scuffles or simple defamation.",
        citation: { sourceId: "bnss", unitNumber: "2", label: "BNSS, Section 2(1)(o)" }
      },
      {
        text: "In practice, this is the difference between a police station registering an FIR and starting an investigation immediately (cognizable) versus recording the substance of the information in a register and referring you to a magistrate (non-cognizable). Whether a specific offence is cognizable or non-cognizable is fixed by the First Schedule to the BNSS, not by how serious the officer personally thinks it is.",
        citation: { sourceId: "bnss", unitNumber: "2", label: "BNSS, Section 2(1)(g)" }
      },
      {
        text: "One mixed case is worth knowing. Where a case relates to two or more offences and at least one of them is cognizable, the whole case is deemed to be a cognizable case, even though the other offences are non-cognizable.",
        citation: { sourceId: "bnss", unitNumber: "174", label: "BNSS, Section 174(4)" }
      }
    ]
  },
  {
    slug: "what-is-an-fir",
    categoryId: "police-fir",
    title: "What Is an FIR?",
    summary:
      "The first record of information about a cognizable offence, how it must be recorded, and the free copy you are entitled to.",
    paragraphs: [
      {
        text: "An FIR — a First Information Report — is the record a police station makes of the first information it receives about a cognizable offence. The law says every such piece of information may be given orally or by electronic communication to an officer in charge of a police station.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)" }
      },
      {
        text: "If you give the information orally, the officer must reduce it to writing themselves or have it written under their direction, and it must be read over to you. Whether it was written by you or written down for you, you then sign it. If you send the information by electronic communication, it is taken on record once you sign it within three days, and its substance is entered in a station register.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)(i)-(ii)" }
      },
      {
        text: "You are entitled to a copy. A copy of the recorded information must be given forthwith and free of cost to the informant or the victim. If a station asks you to pay for it or tells you to come back later for it, that is not what the law provides.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(2)" }
      },
      {
        text: "For certain offences against women listed in the BNSS — including the sexual offences and related provisions in sections 64 to 79 of the Bharatiya Nyaya Sanhita — the information must be recorded by a woman police officer or any woman officer.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1), first proviso" }
      },
      {
        text: "Where the person reporting one of those offences is temporarily or permanently mentally or physically disabled, the information must be recorded by a police officer at that person's residence or another place of their choice, in the presence of an interpreter or special educator, and the recording must be videographed.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1), second proviso" }
      }
    ]
  },
  {
    slug: "fir-vs-ncr",
    categoryId: "police-fir",
    title: "FIR vs NCR",
    summary:
      "Why a non-cognizable complaint is entered in a register and referred to a magistrate instead of becoming an FIR.",
    paragraphs: [
      {
        text: "Both routes start the same way — you walk into a police station and report something. What happens next depends entirely on whether the offence is cognizable or non-cognizable, because the BNSS gives the two situations separate sections.",
        citation: { sourceId: "bnss", unitNumber: "2", label: "BNSS, Section 2(1)(g) and 2(1)(o)" }
      },
      {
        text: "For a cognizable offence, the officer in charge records the information as an FIR under section 173, gives you a free copy, and the police may investigate without waiting for anyone's permission.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)-(2)" }
      },
      {
        text: "For a non-cognizable offence, section 174 applies instead. The officer enters, or causes to be entered, the substance of the information in a register kept for that purpose — this is what is commonly called an NCR, a non-cognizable report — then refers the informant to the Magistrate and forwards the daily diary report of all such cases to the Magistrate fortnightly.",
        citation: { sourceId: "bnss", unitNumber: "174", label: "BNSS, Section 174(1)" }
      },
      {
        text: "The practical consequence is the one that surprises people most: no police officer shall investigate a non-cognizable case without the order of a Magistrate having power to try the case or commit it for trial. Being referred to a magistrate is not the station brushing you off — it is the step the statute requires.",
        citation: { sourceId: "bnss", unitNumber: "174", label: "BNSS, Section 174(2)" }
      },
      {
        text: "Once a Magistrate does order an investigation, the officer receiving that order may exercise the same investigative powers as in a cognizable case, with one exception: the power to arrest without a warrant.",
        citation: { sourceId: "bnss", unitNumber: "174", label: "BNSS, Section 174(3)" }
      },
      {
        text: "And if your report covers several offences at once, the mixed-case rule works in your favour. Where a case relates to two or more offences of which at least one is cognizable, the case is deemed cognizable notwithstanding that the others are not.",
        citation: { sourceId: "bnss", unitNumber: "174", label: "BNSS, Section 174(4)" }
      }
    ],
    scopeNote:
      "Whether a particular offence is cognizable or non-cognizable is fixed by the First Schedule to the BNSS, which is not summarised here. Do not assume a category for your own situation from the examples above."
  },
  {
    slug: "zero-fir",
    categoryId: "police-fir",
    title: "Zero FIR",
    summary:
      "Information about a cognizable offence must be recorded irrespective of where the offence happened, so the wrong police station is not a reason to turn you away.",
    paragraphs: [
      {
        text: "People are often sent away from a police station with the words “this is not our area”. The BNSS addresses this directly. Every information relating to the commission of a cognizable offence — irrespective of the area where the offence is committed — may be given orally or by electronic communication to an officer in charge of a police station.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)" }
      },
      {
        text: "That phrase, “irrespective of the area where the offence is committed”, is the basis of what is commonly called a Zero FIR: the station that receives the information records it even though the offence falls outside its own jurisdiction, and the case is then taken forward by the station that does have jurisdiction.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)" }
      },
      {
        text: "The rest of the FIR safeguards apply exactly as they would anywhere else. The information must be reduced to writing and read over to you if given orally, and a copy of the recorded information must be given to the informant or victim forthwith and free of cost.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)-(2)" }
      },
      {
        text: "This matters most when time does. If you have been harmed away from home, or you are physically unable to reach the station where the offence occurred, the nearest station is a lawful place to report it."
      }
    ],
    scopeNote:
      "The BNSS text quoted here establishes that jurisdiction is not a bar to recording the information. The internal police procedure for transferring a Zero FIR to the station with jurisdiction is administrative practice and is not set out in the ingested statutory text."
  },
  {
    slug: "how-to-file-an-fir",
    categoryId: "police-fir",
    title: "How to File an FIR",
    summary:
      "What the law entitles you to at each step when you report a cognizable offence at a police station.",
    paragraphs: [
      {
        text: "Go to an officer in charge of a police station and give the information. You may give it orally or by electronic communication, and it does not matter which area the offence happened in.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)" }
      },
      {
        text: "If you speak it, the officer writes it down or has it written under their direction, then reads it back to you before you sign it. Read or listen to that read-back carefully — the signed text is the record. If you send it electronically, it goes on record when you sign it within three days.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)(i)-(ii)" }
      },
      {
        text: "Ask for your copy before you leave. A copy of the information as recorded must be given forthwith, free of cost, to the informant or the victim.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(2)" }
      },
      {
        text: "For an offence punishable with three years or more but less than seven years, the officer in charge may, with prior permission from an officer not below the rank of Deputy Superintendent of Police and considering the nature and gravity of the offence, first conduct a preliminary enquiry within fourteen days to see whether a prima facie case exists, or proceed straight to investigation where one already does. A preliminary enquiry in that band is therefore a step the law allows, not a refusal.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(3)" }
      },
      {
        text: "If the offence you are reporting is a non-cognizable one, the station follows a different path — see the FIR vs NCR article in this section."
      }
    ]
  },
  {
    slug: "if-police-refuse-an-fir",
    categoryId: "police-fir",
    title: "What If Police Refuse to Register an FIR?",
    summary:
      "The BNSS gives an aggrieved person a written escalation to the Superintendent of Police, and a further route through a Magistrate.",
    paragraphs: [
      {
        text: "Refusal is anticipated by the statute itself. Any person aggrieved by a refusal on the part of an officer in charge of a police station to record the information may send the substance of that information, in writing and by post, to the Superintendent of Police concerned.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(4)" }
      },
      {
        text: "If the Superintendent of Police is satisfied that the information discloses the commission of a cognizable offence, they shall either investigate the case themselves or direct an investigation by a subordinate police officer, and that officer then has all the powers of an officer in charge of the police station in relation to that offence.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(4)" }
      },
      {
        text: "There is a further route through the courts. A Magistrate empowered under section 210 may, after considering an application supported by an affidavit made under section 173(4), and after such inquiry as the Magistrate thinks necessary and after hearing the police officer's submission, order an investigation.",
        citation: { sourceId: "bnss", unitNumber: "175", label: "BNSS, Section 175(3)" }
      },
      {
        text: "Keep the paperwork. Because the escalation route is defined as sending the substance of the information in writing and by post, a dated copy of what you sent is the thing that later shows what you reported and when."
      }
    ],
    scopeNote:
      "The affidavit-supported application to a Magistrate under section 175(3) is a court filing. This article states that the route exists; preparing that application is work for a lawyer or a legal services authority."
  },
  {
    slug: "what-happens-after-an-fir",
    categoryId: "police-fir",
    title: "What Happens After an FIR?",
    summary:
      "From the first report to the police report at the end of investigation, and what the informant must be told along the way.",
    paragraphs: [
      {
        text: "Once an officer in charge of a police station has reason to suspect the commission of an offence they are empowered to investigate, they must forthwith send a report to a Magistrate empowered to take cognizance, and proceed in person — or depute a subordinate officer of prescribed rank — to the spot to investigate the facts and, if necessary, take measures for the discovery and arrest of the offender.",
        citation: { sourceId: "bnss", unitNumber: "176", label: "BNSS, Section 176(1)" }
      },
      {
        text: "The law also covers the case where police decide not to investigate. If it appears to the officer in charge that there is no sufficient ground for entering on an investigation, they shall not investigate — but they must state the reasons in their report and must forthwith notify the informant.",
        citation: { sourceId: "bnss", unitNumber: "176", label: "BNSS, Section 176(1)-(2)" }
      },
      {
        text: "For offences punishable with seven years or more, the officer in charge must, from a date notified by the State Government within five years, cause a forensic expert to visit the crime scene to collect forensic evidence, and cause the process to be videographed.",
        citation: { sourceId: "bnss", unitNumber: "176", label: "BNSS, Section 176(3)" }
      },
      {
        text: "Every investigation must be completed without unnecessary delay, and for the sexual offences listed in the section it must be completed within two months from the date the information was recorded.",
        citation: { sourceId: "bnss", unitNumber: "193", label: "BNSS, Section 193(1)-(2)" }
      },
      {
        text: "You are entitled to be kept informed. The police officer must, within ninety days, inform the informant or the victim of the progress of the investigation, by any means including electronic communication.",
        citation: { sourceId: "bnss", unitNumber: "193", label: "BNSS, Section 193(3)(ii)" }
      },
      {
        text: "When the investigation ends, the officer in charge forwards a report to the Magistrate stating the names of the parties, the nature of the information, who appears acquainted with the circumstances, whether an offence appears to have been committed and by whom, whether the accused has been arrested, and whether they have been released on bond or bail bond. The action taken must also be communicated to the person who first gave the information.",
        citation: { sourceId: "bnss", unitNumber: "193", label: "BNSS, Section 193(3)" }
      }
    ],
    scopeNote:
      "This traces the investigation stage only. What happens in court after the police report — cognizance, framing of charges, trial and appeal — is outside the scope of this article."
  },
  {
    slug: "complaint-to-a-magistrate",
    categoryId: "police-fir",
    title: "Taking a Complaint Straight to a Magistrate",
    summary:
      "The route that does not go through a police station: how a Magistrate takes cognizance on a complaint, examines the complainant, and decides whether to issue process.",
    paragraphs: [
      {
        text: "A police report is only one of three ways a Magistrate can take up an offence. A Magistrate of the first class — and a specially empowered Magistrate of the second class — may take cognizance of an offence upon receiving a complaint of facts constituting it, upon a police report of those facts, or upon information received from any person other than a police officer, or upon the Magistrate's own knowledge that the offence has been committed.",
        citation: { sourceId: "bnss", unitNumber: "210", label: "BNSS, Section 210(1)" }
      },
      {
        text: "Taking cognizance on a complaint starts with an examination on oath. The Magistrate examines the complainant and any witnesses present upon oath, the substance of that examination is reduced to writing, and it is signed by the complainant, the witnesses and the Magistrate. The Sanhita also requires that no cognizance be taken without giving the accused an opportunity of being heard.",
        citation: { sourceId: "bnss", unitNumber: "223", label: "BNSS, Section 223(1)" }
      },
      {
        text: "That examination is not always necessary. Where the complaint is made in writing, the Magistrate need not examine the complainant and witnesses if the complaint was made by a Court or by a public servant acting in the discharge of official duties, or if the Magistrate makes the case over to another Magistrate.",
        citation: { sourceId: "bnss", unitNumber: "223", label: "BNSS, Section 223(1), provisos" }
      },
      {
        text: "The Magistrate may pause before summoning anyone. On receiving a complaint, the Magistrate may — and, where the accused lives beyond the Magistrate's jurisdiction, must — postpone the issue of process and either inquire into the case personally or direct an investigation by a police officer, to decide whether there is sufficient ground for proceeding. No such investigation may be directed where the offence is triable exclusively by a Court of Session, or where the complainant and witnesses have not been examined on oath.",
        citation: { sourceId: "bnss", unitNumber: "225", label: "BNSS, Section 225(1)" }
      },
      {
        text: "A complaint can end there. If, after considering the statements on oath and the result of any inquiry or investigation, the Magistrate is of opinion that there is no sufficient ground for proceeding, the complaint is dismissed — and the Magistrate must briefly record the reasons for doing so.",
        citation: { sourceId: "bnss", unitNumber: "226", label: "BNSS, Section 226" }
      },
      {
        text: "If there is sufficient ground, process issues. In a summons-case the Magistrate issues a summons for the accused to attend; in a warrant-case, a warrant, or a summons if the Magistrate thinks fit. Summons and warrants may be issued through electronic means, no summons or warrant issues until a list of prosecution witnesses has been filed, and in a complaint case every summons or warrant is accompanied by a copy of the complaint.",
        citation: { sourceId: "bnss", unitNumber: "227", label: "BNSS, Section 227" }
      }
    ],
    scopeNote:
      "This is the general procedure. Whether a particular grievance is better taken to a police station or directly to a Magistrate depends on the offence and the facts, and is worth asking a lawyer or a legal services authority about."
  },
  {
    slug: "search-and-seizure-basics",
    categoryId: "police-fir",
    title: "Search and Seizure: The Basic Safeguards",
    summary:
      "What the law requires before and during a search — recorded grounds, independent witnesses, a woman searching a woman, and audio-video recording.",
    paragraphs: [
      {
        text: "A police officer's power to search without a warrant during an investigation is conditional and must be written down first. Where an officer in charge of a police station, or an officer making an investigation, has reasonable grounds for believing that something necessary for the investigation may be found within the station's limits, and that it cannot otherwise be obtained without undue delay, that officer may search — but only after recording the grounds of belief in the case-diary and specifying, so far as possible, the thing to be searched for.",
        citation: { sourceId: "bnss", unitNumber: "185", label: "BNSS, Section 185(1)" }
      },
      {
        text: "The officer must ordinarily do it personally. A police officer proceeding under that section shall, if practicable, conduct the search in person; if unable to, the officer must record written reasons and may require a subordinate to make the search, delivering a written order to that subordinate.",
        citation: { sourceId: "bnss", unitNumber: "185", label: "BNSS, Section 185(2)-(3)" }
      },
      {
        text: "Independent witnesses are required. Before making a search, the officer must call upon two or more independent and respectable inhabitants of the locality — or of another locality, if none there is available or willing — to attend and witness the search, and may issue a written order requiring them to do so. The search is made in their presence, and a list of all things seized is prepared.",
        citation: { sourceId: "bnss", unitNumber: "103", label: "BNSS, Section 103(4)-(5)" }
      },
      {
        text: "Two protections apply to people rather than places. A person in or about the place who is reasonably suspected of concealing an article may be searched — and if that person is a woman, the search shall be made by another woman, with strict regard to decency. And a person residing in or in charge of a closed place must, on production of the warrant, allow free ingress and afford all reasonable facilities for the search.",
        citation: { sourceId: "bnss", unitNumber: "103", label: "BNSS, Section 103(1) and (3)" }
      },
      {
        text: "The Sanhita adds a recording requirement across the board. The process of conducting a search, or taking possession of property, including preparing the list of things seized and the witnesses signing it, shall be recorded through audio-video electronic means — preferably a mobile phone — and the police officer must forward that recording without delay to the District Magistrate, Sub-divisional Magistrate or Judicial Magistrate of the first class.",
        citation: { sourceId: "bnss", unitNumber: "105", label: "BNSS, Section 105" }
      },
      {
        text: "Seizure has its own reporting chain. Any police officer may seize property alleged or suspected to be stolen, or found in circumstances creating suspicion of an offence, and must forthwith report the seizure to the Magistrate having jurisdiction — reporting also to the officer in charge of the station if the seizing officer is subordinate to them.",
        citation: { sourceId: "bnss", unitNumber: "106", label: "BNSS, Section 106(1)-(3)" }
      }
    ],
    scopeNote:
      "This lists the safeguards the Sanhita writes into a search. It does not advise on how to respond to a search in progress — obstructing a lawful search is itself an offence, and a lawyer or legal services authority is the right place to raise a complaint about how a search was conducted."
  }
];
