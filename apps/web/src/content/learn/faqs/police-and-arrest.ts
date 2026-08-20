import type { Faq } from "../types";

// Police, FIR, arrest and bail. These are the highest-demand questions in
// the project's 313-query citizen-language evaluation set: the sections
// cited below are the ones citizens ask about most often, in their own
// words ("cops won't register my complaint", "the police won't tell me
// why they arrested my brother", "how does bail work").
export const policeAndArrestFaqs: Faq[] = [
  {
    id: "police-refuse-fir",
    question: "The police won't register my FIR. What can I do?",
    categoryId: "police-fir",
    shortAnswer:
      "Information about a cognizable offence has to be recorded, and you are entitled to a free copy of it. If a station refuses, the Sanhita gives you two routes that do not depend on that station: write to the Superintendent of Police, or take a complaint directly to a Magistrate.",
    whatYouCanDo: [
      "Ask for the information to be recorded and for your free copy of it.",
      "If it is still refused, send the substance of the information in writing, by post, to the Superintendent of Police.",
      "You can also place a complaint of the facts before a Magistrate, which does not need a police report at all.",
      "Keep a dated copy of anything you send — that is what later establishes what you reported and when."
    ],
    legalBasis: [
      {
        text: "Every information relating to the commission of a cognizable offence may be given orally or by electronic communication to an officer in charge of a police station, irrespective of the area where the offence is committed. Oral information is reduced to writing, read over to the informant, and signed by them.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)" }
      },
      {
        text: "A copy of the information as recorded is to be given forthwith, free of cost, to the informant or the victim.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(2)" }
      },
      {
        text: "Where an officer in charge refuses to record the information, the informant may send its substance in writing and by post to the Superintendent of Police, who — if satisfied it discloses a cognizable offence — shall investigate personally or direct a subordinate to do so.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(4)" }
      },
      {
        text: "Separately, a Magistrate may take cognizance of an offence upon receiving a complaint of the facts constituting it — a route that does not depend on a police report.",
        citation: { sourceId: "bnss", unitNumber: "210", label: "BNSS, Section 210(1)(a)" }
      }
    ],
    scopeNote:
      "This is the general procedure. Whether a particular incident is a cognizable offence decides which route applies, and that is a legal judgement about your facts — a lawyer or a legal services authority can help you make it.",
    relatedArticles: ["if-police-refuse-an-fir", "what-is-an-fir", "complaint-to-a-magistrate"],
    tags: ["fir", "police refuse", "complaint not registered", "cops won't file", "station refused"]
  },
  {
    id: "report-crime-another-area",
    question: "The offence happened somewhere else. Can I report it where I am now?",
    categoryId: "police-fir",
    shortAnswer:
      "Yes. Information about a cognizable offence must be recorded irrespective of the area where the offence was committed. This is what people mean by a Zero FIR — the station records it and transfers it to the station with jurisdiction.",
    whatYouCanDo: [
      "Give the information at the station you can actually reach.",
      "Take your free copy of what was recorded before you leave."
    ],
    legalBasis: [
      {
        text: "Every information relating to the commission of a cognizable offence, irrespective of the area where the offence is committed, may be given to an officer in charge of a police station.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)" }
      }
    ],
    scopeNote:
      "Recording and investigating are separate things. The station that records it is not necessarily the station that will investigate it — the record is forwarded to the one with jurisdiction.",
    relatedArticles: ["zero-fir", "what-is-an-fir"],
    tags: ["zero fir", "different city", "another state", "wrong police station", "travelling"]
  },
  {
    id: "police-questioning-attendance",
    question: "The police have asked me to come to the station. Do I have to go?",
    categoryId: "police-fir",
    shortAnswer:
      "An investigating officer can require attendance by written order from someone who appears to know about the case. But the Sanhita protects several groups from being made to attend anywhere other than where they live — including women, anyone under fifteen or over sixty, and people with a disability or acute illness.",
    whatYouCanDo: [
      "Ask for the requirement in writing, as the Sanhita contemplates.",
      "If you fall in a protected group, you may ask to be examined where you reside — though you may still attend the station if you are willing to.",
      "You are bound to answer questions truly, except those whose answers would tend to expose you to a criminal charge."
    ],
    legalBasis: [
      {
        text: "A police officer making an investigation may, by order in writing, require the attendance of any person within the limits of their own or an adjoining station who appears to be acquainted with the facts of the case.",
        citation: { sourceId: "bnss", unitNumber: "179", label: "BNSS, Section 179(1)" }
      },
      {
        text: "No male person under the age of fifteen or above sixty, no woman, and no mentally or physically disabled person or person with acute illness shall be required to attend at any place other than where they reside — although they may attend the police station if willing to.",
        citation: { sourceId: "bnss", unitNumber: "179", label: "BNSS, Section 179(1), provisos" }
      },
      {
        text: "A person examined by the police is bound to answer truly all questions relating to the case, other than questions the answers to which would have a tendency to expose them to a criminal charge, penalty or forfeiture.",
        citation: { sourceId: "bnss", unitNumber: "180", label: "BNSS, Section 180(2)" }
      }
    ],
    scopeNote:
      "Being called as a witness and being questioned as a suspect are different situations with very different consequences. If you think you may be treated as an accused, speak to a lawyer before you answer — free legal aid is available if you qualify.",
    relatedArticles: ["confessions-and-police-statements", "free-legal-aid"],
    tags: ["police summons", "called to station", "questioning", "witness", "do i have to go"]
  },
  {
    id: "do-i-have-to-answer-police",
    question: "Do I have to answer everything the police ask me?",
    categoryId: "police-fir",
    shortAnswer:
      "You must answer truthfully, but not questions whose answers would tend to incriminate you — and the Constitution separately protects an accused person from being compelled to be a witness against themselves. A confession made to a police officer cannot be proved against you.",
    legalBasis: [
      {
        text: "A person examined by the police is bound to answer truly all questions relating to the case, other than questions the answers to which would have a tendency to expose them to a criminal charge, penalty or forfeiture.",
        citation: { sourceId: "bnss", unitNumber: "180", label: "BNSS, Section 180(2)" }
      },
      {
        text: "No person accused of any offence shall be compelled to be a witness against himself.",
        citation: { sourceId: "constitution", unitNumber: "20", label: "Constitution, Article 20(3)" }
      },
      {
        text: "No confession made to a police officer shall be proved as against a person accused of any offence, and no confession made in police custody may be proved unless it was made in the immediate presence of a Magistrate.",
        citation: { sourceId: "bsa", unitNumber: "23", label: "BSA, Section 23" }
      }
    ],
    scopeNote:
      "Knowing the rule is not the same as knowing what to say in your own case. What is safe to answer depends on facts only a lawyer who hears your full account can weigh — this page cannot script an interview for you.",
    relatedArticles: ["confessions-and-police-statements", "rights-of-an-arrested-person"],
    tags: ["right to silence", "self incrimination", "confession", "statement to police"],
    urgency: "serious"
  },
  {
    id: "police-search-my-phone",
    question: "Can the police search my phone or take it away?",
    categoryId: "police-fir",
    shortAnswer:
      "A police officer can seize property suspected to be connected with an offence, and can search during an investigation — but the Sanhita puts conditions on both: recorded grounds, independent witnesses, audio-video recording, and a report to a Magistrate.",
    whatYouCanDo: [
      "Ask which provision the search or seizure is being made under.",
      "Note that a search should be witnessed by two independent local residents and recorded on audio-video.",
      "Ask for the list of things seized — a list is required to be prepared.",
      "Property seized has to be reported to the Magistrate having jurisdiction."
    ],
    legalBasis: [
      {
        text: "Any police officer may seize property alleged or suspected to have been stolen, or found in circumstances creating suspicion of the commission of an offence, and must forthwith report the seizure to the Magistrate having jurisdiction.",
        citation: { sourceId: "bnss", unitNumber: "106", label: "BNSS, Section 106(1)-(3)" }
      },
      {
        text: "An officer may search only after recording in writing the grounds of belief in the case-diary and specifying, so far as possible, the thing to be searched for; the search shall if practicable be conducted in person.",
        citation: { sourceId: "bnss", unitNumber: "185", label: "BNSS, Section 185(1)-(2)" }
      },
      {
        text: "Before a search, two or more independent and respectable inhabitants of the locality are called to attend and witness it, the search is made in their presence, and a list of everything seized is prepared.",
        citation: { sourceId: "bnss", unitNumber: "103", label: "BNSS, Section 103(4)-(5)" }
      },
      {
        text: "The process of search and seizure, including the list of things seized and the witnesses signing it, shall be recorded through audio-video electronic means and forwarded without delay to a Magistrate.",
        citation: { sourceId: "bnss", unitNumber: "105", label: "BNSS, Section 105" }
      }
    ],
    scopeNote:
      "These are the safeguards the Sanhita writes in. This page does not advise resisting a search — obstructing a lawful one is itself an offence. A complaint about how a search was conducted belongs with a lawyer, a legal services authority, or the Magistrate the seizure is reported to.",
    relatedArticles: ["search-and-seizure-basics", "privacy-basics"],
    tags: ["phone seized", "police took my phone", "search", "seizure", "laptop", "device"]
  },
  {
    id: "get-seized-property-back",
    question: "The police took my things. When do I get them back?",
    categoryId: "police-fir",
    shortAnswer:
      "Property seized during an investigation is reported to a Magistrate, and it is the court that orders its custody and disposal — either while the case is pending or at its conclusion.",
    whatYouCanDo: [
      "Find out which Magistrate the seizure was reported to.",
      "An application for custody of the property is made to that court, not to the police station."
    ],
    legalBasis: [
      {
        text: "Every police officer seizing property must forthwith report the seizure to the Magistrate having jurisdiction; where the property cannot conveniently be transported to court, custody may be given to a person on a bond to produce it when required.",
        citation: { sourceId: "bnss", unitNumber: "106", label: "BNSS, Section 106(2)-(3)" }
      },
      {
        text: "The Sanhita provides for orders for the custody and disposal of property pending trial, and for its disposal at the conclusion of the trial.",
        citation: { sourceId: "bnss", unitNumber: "497", label: "BNSS, Sections 497-498" }
      }
    ],
    scopeNote:
      "How long this takes, and whether property is returned before or after a trial, depends on the case and on the court's view of it. Nothing here can predict either.",
    relatedArticles: ["search-and-seizure-basics"],
    tags: ["seized property", "get things back", "police took", "return of goods"]
  },
  {
    id: "what-happens-after-fir",
    question: "I filed an FIR. What happens next?",
    categoryId: "police-fir",
    shortAnswer:
      "The police investigate, and on completion send a report to a Magistrate. The action taken has to be communicated to you as the person who first gave the information.",
    legalBasis: [
      {
        text: "As soon as the investigation is completed, the officer in charge forwards a report to a Magistrate empowered to take cognizance of the offence on a police report.",
        citation: { sourceId: "bnss", unitNumber: "193", label: "BNSS, Section 193(3)(i)" }
      },
      {
        text: "The officer shall communicate the action taken, in the manner prescribed, to the person by whom the information relating to the commission of the offence was first given.",
        citation: { sourceId: "bnss", unitNumber: "193", label: "BNSS, Section 193(3)(iii)" }
      },
      {
        text: "Where it appears there is not sufficient evidence or reasonable ground of suspicion to justify forwarding the accused to a Magistrate, the officer releases the accused on a bond to appear if and when required.",
        citation: { sourceId: "bnss", unitNumber: "189", label: "BNSS, Section 189" }
      }
    ],
    scopeNote:
      "Timelines vary by offence and by case. This page cannot tell you when your particular investigation will finish or what it will conclude.",
    relatedArticles: ["what-happens-after-an-fir", "how-to-file-an-fir"],
    tags: ["after fir", "investigation", "charge sheet", "police report", "what next"]
  },
  {
    id: "what-to-do-if-arrested",
    question: "What should I do if I am arrested?",
    categoryId: "arrest-bail",
    shortAnswer:
      "You are entitled to be told why, to have someone informed, and to consult a lawyer of your choice. You must be produced before a Magistrate within twenty-four hours. If you cannot afford a lawyer, free legal aid is available.",
    whatYouCanDo: [
      "Ask to be told the grounds of your arrest — the officer must communicate them.",
      "Name a relative or friend to be informed; the officer must inform them and a designated police officer.",
      "Ask to consult a lawyer of your choice, and ask for legal aid if you cannot afford one.",
      "Note the time of arrest — the twenty-four-hour period runs from it, excluding travel to court."
    ],
    legalBasis: [
      {
        text: "No person arrested shall be detained without being informed, as soon as may be, of the grounds of arrest, nor denied the right to consult and be defended by a legal practitioner of their choice.",
        citation: { sourceId: "constitution", unitNumber: "22", label: "Constitution, Article 22(1)" }
      },
      {
        text: "Every officer arresting without warrant shall forthwith communicate full particulars of the offence or other grounds for the arrest, and — where the offence is not non-bailable — inform the person that they are entitled to be released on bail and may arrange sureties.",
        citation: { sourceId: "bnss", unitNumber: "47", label: "BNSS, Section 47" }
      },
      {
        text: "The officer must forthwith inform a relative, friend or other person nominated by the arrested person about the arrest and where they are held, and inform the arrested person of that right on arrival at the station.",
        citation: { sourceId: "bnss", unitNumber: "48", label: "BNSS, Section 48(1)-(2)" }
      },
      {
        text: "No police officer shall detain a person arrested without warrant longer than is reasonable, and that period shall not, absent a special order of a Magistrate, exceed twenty-four hours excluding the time necessary for the journey to court.",
        citation: { sourceId: "bnss", unitNumber: "58", label: "BNSS, Section 58" }
      }
    ],
    scopeNote:
      "These are your entitlements, not a strategy. What to say, whether to apply for bail and how are decisions to make with a lawyer who knows your facts — free legal aid is available if you qualify.",
    relatedArticles: ["rights-of-an-arrested-person", "what-happens-when-arrested", "free-legal-aid"],
    tags: ["arrested", "arrest", "picked up", "detained", "custody", "my rights"],
    urgency: "serious"
  },
  {
    id: "police-wont-say-why-arrested",
    question: "The police arrested my relative and won't say why. Is that allowed?",
    categoryId: "arrest-bail",
    shortAnswer:
      "No. The grounds of arrest must be communicated forthwith, and someone the arrested person nominates must be informed of the arrest and of where they are being held. The Magistrate before whom they are produced has a duty to check that this was done.",
    whatYouCanDo: [
      "Ask which police station they are being held at — the officer must inform a nominated person of exactly this.",
      "Ask a lawyer to raise it before the Magistrate; the Magistrate is required to satisfy themselves that these requirements were complied with.",
      "Free legal aid is available if the family cannot afford a lawyer."
    ],
    legalBasis: [
      {
        text: "Every officer arresting without warrant shall forthwith communicate to the person full particulars of the offence for which they are arrested or other grounds for the arrest.",
        citation: { sourceId: "bnss", unitNumber: "47", label: "BNSS, Section 47(1)" }
      },
      {
        text: "The officer must forthwith give information about the arrest and the place where the arrested person is held to a relative, friend or other person nominated by them, and to the designated police officer in the district; an entry of who was informed is made in a station book.",
        citation: { sourceId: "bnss", unitNumber: "48", label: "BNSS, Section 48(1)-(3)" }
      },
      {
        text: "It is the duty of the Magistrate before whom the arrested person is produced to satisfy themselves that these requirements have been complied with.",
        citation: { sourceId: "bnss", unitNumber: "48", label: "BNSS, Section 48(4)" }
      },
      {
        text: "No person arrested shall be denied the right to consult and be defended by a legal practitioner of their choice, and shall be produced before a Magistrate within twenty-four hours of arrest.",
        citation: { sourceId: "constitution", unitNumber: "22", label: "Constitution, Article 22(1)-(2)" }
      }
    ],
    scopeNote:
      "Enforcing these entitlements in a live case is work for a lawyer before the Magistrate. This page states what the law requires; it cannot intervene in a particular arrest.",
    relatedArticles: ["rights-of-an-arrested-person", "free-legal-aid"],
    tags: ["arrested my brother", "no reason given", "grounds of arrest", "which station", "family arrested"],
    urgency: "serious"
  },
  {
    id: "how-long-can-police-hold",
    question: "How long can the police hold someone before a court sees them?",
    categoryId: "arrest-bail",
    shortAnswer:
      "Twenty-four hours, excluding the journey to court. Detention beyond that requires a Magistrate's authorisation, and the accused has to be forwarded to the Magistrate with the case-diary entries.",
    legalBasis: [
      {
        text: "No police officer shall detain in custody a person arrested without warrant for longer than is reasonable, and that period shall not, in the absence of a special order of a Magistrate, exceed twenty-four hours exclusive of the time necessary for the journey from the place of arrest to the Magistrate's Court.",
        citation: { sourceId: "bnss", unitNumber: "58", label: "BNSS, Section 58" }
      },
      {
        text: "Where the investigation cannot be completed within that period and there are grounds for believing the accusation is well-founded, the officer transmits the case-diary entries to the nearest Magistrate and forwards the accused, who may then authorise further detention.",
        citation: { sourceId: "bnss", unitNumber: "187", label: "BNSS, Section 187(1)-(2)" }
      },
      {
        text: "Every person arrested and detained shall be produced before the nearest magistrate within a period of twenty-four hours of such arrest, excluding the time necessary for the journey, and shall not be detained beyond that period without the authority of a magistrate.",
        citation: { sourceId: "constitution", unitNumber: "22", label: "Constitution, Article 22(2)" }
      }
    ],
    scopeNote:
      "The limits on how long a Magistrate may then authorise detention depend on the offence and are set out in the Sanhita. This page does not calculate them for a particular case.",
    relatedArticles: ["what-happens-when-arrested", "rights-of-an-arrested-person"],
    tags: ["24 hours", "how long", "custody", "remand", "detained", "produced before magistrate"],
    urgency: "serious"
  },
  {
    id: "how-does-bail-work",
    question: "How does bail work?",
    categoryId: "arrest-bail",
    shortAnswer:
      "Bail is release from custody on conditions — usually a bond, sometimes with sureties. For a bailable offence release is a right if you are prepared to give bail; for a non-bailable offence it is a matter for the court's discretion, within limits the Sanhita sets.",
    whatYouCanDo: [
      "For a bailable offence, say that you are prepared to give bail — release then follows.",
      "If you cannot furnish a surety, say so: the Sanhita requires discharge on your own bond where you are indigent.",
      "For a non-bailable offence, an application is made to the court; a lawyer or legal-aid counsel should make it."
    ],
    legalBasis: [
      {
        text: "When a person not accused of a non-bailable offence is arrested or appears before a court and is prepared to give bail, that person shall be released on bail.",
        citation: { sourceId: "bnss", unitNumber: "478", label: "BNSS, Section 478(1)" }
      },
      {
        text: "Where the person is indigent and unable to furnish surety, the officer or Court shall discharge them on their executing a bond for appearance instead of taking a bail bond. Inability to give a bail bond within a week of arrest is sufficient ground to presume indigence.",
        citation: { sourceId: "bnss", unitNumber: "478", label: "BNSS, Section 478(1), proviso and Explanation" }
      },
      {
        text: "For a non-bailable offence release on bail is possible but restricted — it shall not be granted where there appear reasonable grounds for believing the person is guilty of an offence punishable with death or imprisonment for life, subject to provisos allowing release of a child, a woman, or a sick or infirm person.",
        citation: { sourceId: "bnss", unitNumber: "480", label: "BNSS, Section 480(1)" }
      },
      {
        text: "The amount of every bond shall be fixed with due regard to the circumstances of the case and shall not be excessive, and the High Court or Court of Session may direct that it be reduced.",
        citation: { sourceId: "bnss", unitNumber: "484", label: "BNSS, Section 484" }
      }
    ],
    scopeNote:
      "Whether a particular offence is bailable, and whether a court will grant bail, depends on the offence and the facts. This page explains the framework, not the outcome of any application.",
    relatedArticles: ["what-is-bail", "bailable-vs-non-bailable", "bail-procedure-basics", "bonds-and-sureties"],
    tags: ["bail", "release", "surety", "bond", "get out of jail", "jamanat"]
  },
  {
    id: "bail-before-arrest",
    question: "Can I get bail before I am arrested?",
    categoryId: "arrest-bail",
    shortAnswer:
      "Yes — that is what an application under Section 482 is for. A person who has reason to believe they may be arrested for a non-bailable offence can apply to the High Court or the Court of Session for a direction that they be released on bail if the arrest happens.",
    whatYouCanDo: [
      "The application goes to the High Court or the Court of Session, not to a police station or a Magistrate.",
      "Expect conditions — the court may require you to be available for questioning, not to influence witnesses, and not to leave India without permission."
    ],
    legalBasis: [
      {
        text: "When a person has reason to believe they may be arrested on an accusation of having committed a non-bailable offence, they may apply to the High Court or the Court of Session for a direction that, in the event of arrest, they shall be released on bail.",
        citation: { sourceId: "bnss", unitNumber: "482", label: "BNSS, Section 482(1)" }
      },
      {
        text: "The court may attach conditions, including that the person make themselves available for interrogation as required, that they not directly or indirectly induce or threaten anyone acquainted with the facts, and that they not leave India without the court's permission.",
        citation: { sourceId: "bnss", unitNumber: "482", label: "BNSS, Section 482(2)" }
      }
    ],
    scopeNote:
      "This is a court application with real strategic consequences and should be made with a lawyer. If you believe you may be arrested, that is a reason to get advice quickly rather than to rely on a general page.",
    relatedArticles: ["regular-vs-anticipatory-bail", "what-is-bail"],
    tags: ["anticipatory bail", "before arrest", "482", "pre-arrest bail", "may be arrested"],
    urgency: "serious"
  },
  {
    id: "cannot-afford-surety",
    question: "I have been granted bail but cannot arrange a surety. What happens?",
    categoryId: "arrest-bail",
    shortAnswer:
      "The Sanhita provides for exactly this. Where a person is indigent and unable to furnish a surety, they are to be discharged on their own bond instead — and being unable to give a bail bond within a week of arrest is itself sufficient ground to presume indigence.",
    whatYouCanDo: [
      "Tell the court or the officer that you are unable to furnish a surety.",
      "Ask for release on your own bond under the proviso to Section 478(1).",
      "Ask a legal-aid lawyer to make the application if you do not have one — persons in custody are an entitled category."
    ],
    legalBasis: [
      {
        text: "The officer or Court shall, if the person is indigent and unable to furnish surety, discharge them on their executing a bond for their appearance instead of taking a bail bond.",
        citation: { sourceId: "bnss", unitNumber: "478", label: "BNSS, Section 478(1), proviso" }
      },
      {
        text: "Where a person is unable to give a bail bond within a week of the date of arrest, that is sufficient ground for the officer or Court to presume that they are an indigent person.",
        citation: { sourceId: "bnss", unitNumber: "478", label: "BNSS, Section 478(1), Explanation" }
      },
      {
        text: "A person in custody is an entitled category for free legal services under the Legal Services Authorities Act.",
        citation: { sourceId: "lsa", unitNumber: "12", label: "Legal Services Authorities Act, Section 12(g)" }
      }
    ],
    scopeNote:
      "Whether a court treats a person as indigent is its own determination on the material before it. This page explains the provision, not how a particular court will apply it.",
    relatedArticles: ["bonds-and-sureties", "what-is-bail", "free-legal-aid"],
    tags: ["no surety", "cannot afford bail", "poor", "indigent", "own bond"]
  },
  {
    id: "woman-arrest-at-night",
    question: "Can a woman be arrested at night?",
    categoryId: "arrest-bail",
    shortAnswer:
      "Only in exceptional circumstances. The Sanhita restricts the arrest of a woman after sunset and before sunrise, and also limits how an arrest of a woman may be physically made.",
    legalBasis: [
      {
        text: "Save in exceptional circumstances, no woman shall be arrested after sunset and before sunrise.",
        citation: { sourceId: "bnss", unitNumber: "43", label: "BNSS, Section 43(5)" }
      },
      {
        text: "Where a woman is to be arrested, unless the circumstances indicate to the contrary, her submission to custody on an oral intimation of arrest shall be presumed, and unless the circumstances otherwise require or the officer is female, the officer shall not touch her person to make the arrest.",
        citation: { sourceId: "bnss", unitNumber: "43", label: "BNSS, Section 43(1), proviso" }
      }
    ],
    scopeNote:
      "What counts as an exceptional circumstance is decided on the facts. This page states the rule, not whether a particular arrest was lawful.",
    relatedArticles: ["what-happens-when-arrested", "rights-of-an-arrested-person"],
    tags: ["woman arrest", "night arrest", "female", "sunset", "sunrise"]
  }
];
