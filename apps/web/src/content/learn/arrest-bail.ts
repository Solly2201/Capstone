import type { LearningArticle } from "./types";

export const arrestBailArticles: LearningArticle[] = [
  {
    slug: "what-happens-when-arrested",
    categoryId: "arrest-bail",
    title: "What Happens When You Are Arrested",
    summary:
      "The sequence an arrest follows in law: the arrest itself, the police station, the twenty-four hour limit, and the magistrate.",
    paragraphs: [
      {
        text: "An arrest is a formal act — the officer must actually touch or confine you, unless you submit to custody by word or action. For women, submission to an oral statement of arrest is presumed, and unless the circumstances require otherwise, only a female police officer may touch a woman to arrest her.",
        citation: { sourceId: "bnss", unitNumber: "43", label: "BNSS, Section 43(1)" }
      },
      {
        text: "Handcuffs may only be used with regard to the nature and gravity of the offence — for example against a habitual or repeat offender, someone who escaped custody, or someone accused of organised crime, terrorism, serious drug offences, murder, rape, or similar serious offences. It is not a routine default for every arrest.",
        citation: { sourceId: "bnss", unitNumber: "43", label: "BNSS, Section 43(3)" }
      },
      {
        text: "Except in exceptional circumstances, a woman cannot be arrested after sunset and before sunrise. If those circumstances genuinely exist, the arresting woman police officer must first get written permission from a magistrate.",
        citation: { sourceId: "bnss", unitNumber: "43", label: "BNSS, Section 43(5)" }
      },
      {
        text: "An arrested person shall not be subjected to more restraint than is necessary to prevent escape, and whoever has custody of an accused has a duty to take reasonable care of their health and safety.",
        citation: { sourceId: "bnss", unitNumber: "46", label: "BNSS, Sections 46 and 56" }
      },
      {
        text: "Soon after the arrest is made, the arrested person is to be examined by a government medical officer, or by a registered medical practitioner if no medical officer is available. The examiner records any injuries or marks of violence and the approximate time they may have been inflicted, and a copy of that report goes to the arrested person or a person they nominate. Where the arrested person is a woman, the examination is made only by or under the supervision of a female medical officer or practitioner.",
        citation: { sourceId: "bnss", unitNumber: "53", label: "BNSS, Section 53" }
      },
      {
        text: "A police officer making an arrest without a warrant must, without unnecessary delay and subject to the bail provisions, take or send the arrested person before a Magistrate having jurisdiction, or before the officer in charge of a police station.",
        citation: { sourceId: "bnss", unitNumber: "57", label: "BNSS, Section 57" }
      },
      {
        text: "There is a hard limit on how long you can be held before being brought before a magistrate: no more than twenty-four hours from arrest, not counting travel time to the magistrate's court, unless a magistrate specifically orders otherwise.",
        citation: { sourceId: "bnss", unitNumber: "58", label: "BNSS, Section 58" }
      },
      {
        text: "If the investigation cannot be completed within those twenty-four hours and there are grounds for believing the accusation is well-founded, the accused is forwarded to the nearest Magistrate along with a copy of the case diary entries. That Magistrate may authorise detention in such custody as they think fit, and detention beyond the initial period is capped: ninety days where the offence is punishable with death, imprisonment for life or ten years or more, and sixty days for any other offence. On expiry of that period the accused shall be released on bail if they are prepared to and do furnish bail.",
        citation: { sourceId: "bnss", unitNumber: "187", label: "BNSS, Section 187(1)-(3)" }
      },
      {
        text: "Finally, you cannot be discharged from arrest except on a bond, a bail bond, or a magistrate's specific order — an officer cannot simply let you go informally once you are in custody.",
        citation: { sourceId: "bnss", unitNumber: "60", label: "BNSS, Section 60" }
      }
    ],
    scopeNote:
      "This is the procedure, not advice for a live situation. If you or someone you know is being arrested right now, the immediate priority is knowing these rights exist and contacting a lawyer — not arguing law with the officer on the spot."
  },
  {
    slug: "rights-of-an-arrested-person",
    categoryId: "arrest-bail",
    title: "Rights of an Arrested Person",
    summary:
      "The constitutional guarantees and the BNSS duties that attach the moment someone is taken into custody.",
    paragraphs: [
      {
        text: "Two constitutional guarantees apply first. No arrested person may be detained in custody without being informed, as soon as may be, of the grounds for the arrest, and none may be denied the right to consult and to be defended by a legal practitioner of their choice.",
        citation: { sourceId: "constitution", unitNumber: "22", label: "Constitution, Article 22(1)" }
      },
      {
        text: "Every arrested and detained person must be produced before the nearest magistrate within twenty-four hours of arrest, excluding travel time to the court, and may not be held beyond that without the magistrate's authority.",
        citation: { sourceId: "constitution", unitNumber: "22", label: "Constitution, Article 22(2)" }
      },
      {
        text: "No person accused of an offence can be compelled to be a witness against themselves.",
        citation: { sourceId: "constitution", unitNumber: "20", label: "Constitution, Article 20(3)" }
      },
      {
        text: "The BNSS turns those guarantees into specific duties on the officer. You have the right to know why you are being arrested — the officer must communicate the full particulars of the offence, or the grounds for the arrest, immediately. If the offence is not a non-bailable one, they must also tell you that you are entitled to bail and can arrange sureties.",
        citation: { sourceId: "bnss", unitNumber: "47", label: "BNSS, Section 47" }
      },
      {
        text: "You have the right to have someone told. The police must promptly inform a relative, friend or another person you name about your arrest and where you are being held, and a designated police officer in the district is also notified. This has to happen as soon as you reach the police station.",
        citation: { sourceId: "bnss", unitNumber: "48", label: "BNSS, Section 48" }
      },
      {
        text: "You have the right to meet an advocate of your choice during interrogation — though not to have them present throughout the entire interrogation.",
        citation: { sourceId: "bnss", unitNumber: "38", label: "BNSS, Section 38" }
      },
      {
        text: "Where an officer sends a subordinate to make an arrest outside their presence, the subordinate must be given a written order specifying the person to be arrested and the offence or cause, and must notify the substance of that order to the person being arrested — and show it to them if asked.",
        citation: { sourceId: "bnss", unitNumber: "55", label: "BNSS, Section 55(1)" }
      },
      {
        text: "Physical safeguards run alongside these. No more restraint than is necessary to prevent escape; a duty of reasonable care for the health and safety of the accused; and a medical examination soon after arrest whose report records any injuries or marks of violence and is copied to you or a person you nominate.",
        citation: { sourceId: "bnss", unitNumber: "53", label: "BNSS, Sections 46, 53 and 56" }
      },
      {
        text: "If a person dies or disappears, or rape is alleged to have been committed on a woman, while in police custody or other authorised custody, an inquiry must be held by the Magistrate within whose local jurisdiction the offence has been committed, in addition to any police inquiry or investigation.",
        citation: { sourceId: "bnss", unitNumber: "196", label: "BNSS, Section 196(2)" }
      }
    ]
  },
  {
    slug: "what-is-bail",
    categoryId: "arrest-bail",
    title: "What Is Bail?",
    summary:
      "Bail is release from custody on conditions, secured by a bond or bail bond — and for some offences it is a right rather than a discretion.",
    paragraphs: [
      {
        text: "Bail means the release of a person accused of, or suspected of, the commission of an offence from the custody of law upon certain conditions imposed by an officer or Court, on that person executing a bond or a bail bond.",
        citation: { sourceId: "bnss", unitNumber: "2", label: "BNSS, Section 2(1)(b)" }
      },
      {
        text: "The two instruments are different. A bail bond is an undertaking for release with a surety — someone else vouching for you. A bond is a personal undertaking for release without a surety. Which one applies depends on the terms the officer or court sets.",
        citation: { sourceId: "bnss", unitNumber: "2", label: "BNSS, Sections 2(1)(d)-(e)" }
      },
      {
        text: "Bail is not always discretionary. Where a person who is not accused of a non-bailable offence is arrested or detained without warrant, or appears or is brought before a Court, and is prepared to give bail at any time while in custody or at any stage of the proceeding, that person shall be released on bail.",
        citation: { sourceId: "bnss", unitNumber: "478", label: "BNSS, Section 478(1)" }
      },
      {
        text: "Poverty is expressly addressed. If the person is indigent and unable to furnish surety, the officer or Court shall discharge them on a personal bond instead of taking a bail bond. Where a person is unable to give a bail bond within a week of arrest, that is sufficient ground to presume they are indigent for this purpose.",
        citation: { sourceId: "bnss", unitNumber: "478", label: "BNSS, Section 478(1), proviso and Explanation" }
      },
      {
        text: "The amount is meant to be workable, not punitive. The amount of every bond executed under the bail chapter shall be fixed with due regard to the circumstances of the case and shall not be excessive, and a High Court or Court of Session may direct that bail required by a police officer or Magistrate be reduced.",
        citation: { sourceId: "bnss", unitNumber: "484", label: "BNSS, Section 484" }
      },
      {
        text: "Bail can also be lost. Where a person has failed to comply with the conditions of the bond or bail bond as to time and place of attendance, the Court may refuse to release them on bail when they next appear or are brought in custody in the same case.",
        citation: { sourceId: "bnss", unitNumber: "478", label: "BNSS, Section 478(2)" }
      }
    ]
  },
  {
    slug: "bailable-vs-non-bailable",
    categoryId: "arrest-bail",
    title: "Bailable vs Non-Bailable Offences",
    summary: "Some offences give you a right to bail. Others leave it to a court's discretion.",
    paragraphs: [
      {
        text: "A bailable offence is one the First Schedule to the BNSS marks as bailable, or that some other law makes bailable. A non-bailable offence is defined simply as any other offence — the category is the residue, not a separate list.",
        citation: { sourceId: "bnss", unitNumber: "2", label: "BNSS, Section 2(1)(c)" }
      },
      {
        text: "For a bailable offence, release is mandatory rather than discretionary: a person not accused of a non-bailable offence who is arrested or detained without warrant, and who is prepared to give bail, shall be released on bail.",
        citation: { sourceId: "bnss", unitNumber: "478", label: "BNSS, Section 478(1)" }
      },
      {
        text: "For a non-bailable offence, a person may still be released on bail by a Court other than the High Court or Court of Session, but two bars apply: they shall not be released if there appear reasonable grounds for believing they are guilty of an offence punishable with death or imprisonment for life, or if the offence is cognizable and they have the specified history of previous convictions.",
        citation: { sourceId: "bnss", unitNumber: "480", label: "BNSS, Section 480(1)(i)-(ii)" }
      },
      {
        text: "Those bars are not absolute. The Court may direct release on bail even in those cases if the person is a child, a woman, or is sick or infirm, and may do so in the second case for any other special reason it records as just and proper.",
        citation: { sourceId: "bnss", unitNumber: "480", label: "BNSS, Section 480(1), provisos" }
      },
      {
        text: "Where the offence is punishable with death, imprisonment for life, or seven years or more, the Court shall not grant bail under this sub-section without giving the Public Prosecutor an opportunity of hearing.",
        citation: { sourceId: "bnss", unitNumber: "480", label: "BNSS, Section 480(1), fourth proviso" }
      },
      {
        text: "One frequently misunderstood point: the mere fact that the accused may be needed for identification by witnesses, or for police custody beyond the first fifteen days, is not by itself a sufficient ground to refuse bail to someone otherwise entitled to it who undertakes to comply with the Court's directions.",
        citation: { sourceId: "bnss", unitNumber: "480", label: "BNSS, Section 480(1), third proviso" }
      }
    ],
    scopeNote:
      "Whether a specific offence is bailable or non-bailable is fixed by the First Schedule to the BNSS or by another statute, and is not summarised here."
  },
  {
    slug: "regular-vs-anticipatory-bail",
    categoryId: "arrest-bail",
    title: "Regular vs Anticipatory Bail",
    summary:
      "Regular bail releases someone already in custody. Anticipatory bail is a direction obtained in advance by someone who fears arrest.",
    paragraphs: [
      {
        text: "Regular bail operates on a person who is already arrested, detained, or before the Court. Section 478 covers those not accused of a non-bailable offence, and section 480 covers release in non-bailable cases by a Court other than the High Court or Court of Session.",
        citation: { sourceId: "bnss", unitNumber: "480", label: "BNSS, Sections 478 and 480" }
      },
      {
        text: "Anticipatory bail runs the other way round in time. When a person has reason to believe that they may be arrested on an accusation of having committed a non-bailable offence, they may apply to the High Court or the Court of Session for a direction that, in the event of such arrest, they shall be released on bail.",
        citation: { sourceId: "bnss", unitNumber: "482", label: "BNSS, Section 482(1)" }
      },
      {
        text: "Such a direction usually carries conditions. The Court may require the person to make themselves available for interrogation by a police officer as and when required; not to directly or indirectly induce, threaten or promise anything to a person acquainted with the facts so as to dissuade them from disclosing those facts; not to leave India without the Court's previous permission; and any other condition available under section 480(3).",
        citation: { sourceId: "bnss", unitNumber: "482", label: "BNSS, Section 482(2)" }
      },
      {
        text: "The direction then takes effect on arrest. If the person is later arrested without warrant on that accusation and is prepared to give bail, they shall be released on bail; and if a Magistrate taking cognizance decides a warrant should issue in the first instance, it must be a bailable warrant conforming to the Court's direction.",
        citation: { sourceId: "bnss", unitNumber: "482", label: "BNSS, Section 482(3)" }
      },
      {
        text: "Anticipatory bail is not available for every accusation. Section 482 does not apply to a case involving arrest on an accusation of having committed an offence under section 65 or sub-section (2) of section 70 of the Bharatiya Nyaya Sanhita, 2023.",
        citation: { sourceId: "bnss", unitNumber: "482", label: "BNSS, Section 482(4)" }
      },
      {
        text: "Separately from both, a High Court or Court of Session has its own power to direct that an accused person in custody be released on bail, and to set aside or modify a condition imposed by a Magistrate — and equally to direct that a person released on bail be arrested and committed to custody.",
        citation: { sourceId: "bnss", unitNumber: "483", label: "BNSS, Section 483(1) and (3)" }
      }
    ]
  },
  {
    slug: "bail-procedure-basics",
    categoryId: "arrest-bail",
    title: "Basic Bail Procedure",
    summary:
      "Who decides, what conditions can be attached, what happens to an undertrial held too long, and where an appeal-stage bond fits in.",
    paragraphs: [
      {
        text: "Bail can come from two places. A police officer in charge of a police station can release a person who is not accused of a non-bailable offence and is prepared to give bail; and a Court can do the same at any stage of the proceeding before it.",
        citation: { sourceId: "bnss", unitNumber: "478", label: "BNSS, Section 478(1)" }
      },
      {
        text: "In non-bailable cases, a Court other than the High Court or Court of Session decides under section 480, subject to the two bars and their provisos. Where those bars apply, or the Magistrate's conditions need changing, the application moves up to the High Court or the Court of Session under section 483.",
        citation: { sourceId: "bnss", unitNumber: "483", label: "BNSS, Sections 480 and 483(1)" }
      },
      {
        text: "The Public Prosecutor has a role in the serious cases. Before granting bail for an offence triable exclusively by the Court of Session, or punishable with imprisonment for life, the High Court or Court of Session must give notice of the bail application to the Public Prosecutor unless it records in writing why that is not practicable.",
        citation: { sourceId: "bnss", unitNumber: "483", label: "BNSS, Section 483(1), first proviso" }
      },
      {
        text: "Conditions can be attached. Where a person is released on bail under section 480(1) for an offence punishable with imprisonment of seven years or more, or under the chapters of the Bharatiya Nyaya Sanhita listed in the section, the Court shall impose conditions including attending in accordance with the bond and not committing a similar offence.",
        citation: { sourceId: "bnss", unitNumber: "480", label: "BNSS, Section 480(3)" }
      },
      {
        text: "Long pre-trial detention has its own release rule. Where a person has, during investigation, inquiry or trial, undergone detention up to one-half of the maximum imprisonment specified for the offence — and that offence does not carry death or life imprisonment — the Court shall release them on bail. For a first-time offender who has never been convicted of any offence, the threshold is one-third, and release is on bond.",
        citation: { sourceId: "bnss", unitNumber: "479", label: "BNSS, Section 479(1)" }
      },
      {
        text: "That release is not automatic in every case: the Court may, after hearing the Public Prosecutor and recording written reasons, order continued detention beyond one-half — but no person may in any case be detained during investigation, inquiry or trial for longer than the maximum imprisonment provided for the offence. Where investigation, inquiry or trial in more than one offence or multiple cases is pending against a person, section 479 does not entitle them to release.",
        citation: { sourceId: "bnss", unitNumber: "479", label: "BNSS, Section 479(1)-(2)" }
      },
      {
        text: "The jail administration is required to act on this. On completion of the one-half or one-third period, the Superintendent of the jail where the accused is detained shall forthwith make a written application to the Court to proceed under section 479(1).",
        citation: { sourceId: "bnss", unitNumber: "479", label: "BNSS, Section 479(3)" }
      },
      {
        text: "There is also a bond that looks ahead to appeal. Before the conclusion of trial and before disposal of an appeal, the trial Court or Appellate Court shall require the accused to execute a bond or bail bond to appear before the higher Court when it issues notice on any appeal or petition against the judgment; that bond stays in force for six months.",
        citation: { sourceId: "bnss", unitNumber: "481", label: "BNSS, Section 481(1)" }
      }
    ],
    scopeNote:
      "This describes the structure the BNSS sets out. It is not a guide to drafting or arguing a bail application, and it does not cover which court to approach on particular facts. Applying for bail is exactly the situation where you should engage a lawyer — or, if you cannot afford one, a legal services authority (see Free Legal Aid)."
  },
  {
    slug: "bonds-and-sureties",
    categoryId: "arrest-bail",
    title: "Bonds and Sureties",
    summary:
      "What a bail bond actually is, who a surety is and what they take on, and what happens when a bond is forfeited.",
    paragraphs: [
      {
        text: "Bail is granted on a bond. Before a person is released, a bond for a sum the police officer or Court thinks sufficient is executed by that person — and, where release is on bail with sureties, by one or more sufficient sureties — conditioned that the person will attend at the time and place named in the bond and continue to attend until otherwise directed.",
        citation: { sourceId: "bnss", unitNumber: "485", label: "BNSS, Section 485(1)" }
      },
      {
        text: "Conditions attached to a release become part of the bond, and where the case requires it the bond also binds the released person to appear when called upon before the High Court, Court of Session or other Court to answer the charge.",
        citation: { sourceId: "bnss", unitNumber: "485", label: "BNSS, Section 485(2)-(3)" }
      },
      {
        text: "The amount is not meant to be a barrier. The amount of every bond executed under this Chapter shall be fixed with due regard to the circumstances of the case and shall not be excessive — and the High Court or Court of Session may direct that bail required by a police officer or Magistrate be reduced.",
        citation: { sourceId: "bnss", unitNumber: "484", label: "BNSS, Section 484" }
      },
      {
        text: "A surety takes on a real obligation and must disclose their exposure. Every person standing surety must make a declaration before the Court as to the number of persons for whom they have stood surety, including the accused, with all the relevant particulars. The Court may accept affidavits, or hold an enquiry, to decide whether a surety is fit or sufficient.",
        citation: { sourceId: "bnss", unitNumber: "486", label: "BNSS, Sections 485(4) and 486" }
      },
      {
        text: "Release follows execution of the bond. As soon as the bond or bail bond has been executed the person is released, and where they are in jail the Court admitting them to bail issues an order of release to the officer in charge of the jail. This does not require release of a person liable to be detained for some other matter.",
        citation: { sourceId: "bnss", unitNumber: "487", label: "BNSS, Section 487" }
      },
      {
        text: "A surety can get out. All or any sureties may at any time apply to a Magistrate to discharge the bond wholly or so far as it relates to them; the Magistrate then issues a warrant bringing the released person before the court, discharges the bond, and calls on that person to find other sufficient sureties — and may commit them to jail if they fail to do so.",
        citation: { sourceId: "bnss", unitNumber: "489", label: "BNSS, Section 489" }
      },
      {
        text: "Forfeiture has consequences for whoever is bound. Where a Court is satisfied that a bond has been forfeited, it records the grounds of that proof and may call upon any person bound by the bond to pay the penalty or show cause why it should not be paid. If sufficient cause is not shown and the penalty is not paid, the Court may recover it as if it were a fine it had imposed.",
        citation: { sourceId: "bnss", unitNumber: "491", label: "BNSS, Section 491" }
      }
    ],
    scopeNote:
      "Standing surety for someone is a financial commitment enforceable by a court. Whether to do it, and for how much, is a personal decision worth taking advice on rather than a question this page can answer."
  }
];
