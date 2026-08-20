import type { LearningArticle } from "./types";

/**
 * Right to Information articles.
 *
 * Every substantive claim below is written against the ingested text of
 * the Right to Information Act, 2005 (services/ai/data/legal-corpus/rti),
 * and cites the section it came from. Nothing here is written from
 * general knowledge of how RTI works in practice.
 *
 * Two deliberate silences:
 *
 * - **Fee amounts.** The Act says a request carries "such fee as may be
 *   prescribed" (s.6(1)) and that the fee must be reasonable (s.7(5)).
 *   The actual rupee figures live in rules made under s.27/s.28, which
 *   are not ingested, so no amount is stated anywhere in these articles.
 * - **The Commissions' composition and tenure.** ss.13, 16 and 27 were
 *   replaced by the Right to Information (Amendment) Act, 2019 and are
 *   excluded from the corpus, so nothing here describes how long an
 *   Information Commissioner serves or on what terms.
 */
export const rightToInformationArticles: LearningArticle[] = [
  {
    slug: "what-is-the-right-to-information",
    categoryId: "right-to-information",
    title: "What Is the Right to Information?",
    summary:
      "A statutory right for every citizen to ask a public authority for information it holds — and a law that overrides the Official Secrets Act where the two conflict.",
    scopeNote:
      "This explains the right itself. How to make a request, what can be refused, and what to do about a refusal are covered in the other articles in this category.",
    paragraphs: [
      {
        text: "The Act states the right in a single sentence: subject to the provisions of the Act, all citizens shall have the right to information. The right is not limited to people who can show a special interest in the subject, and it is not a favour the office grants — it is an entitlement the statute confers.",
        citation: { sourceId: "rti", unitNumber: "3", label: "Right to Information Act, 2005, Section 3" }
      },
      {
        text: "The right runs against a \"public authority\". The Act defines that as a body established or constituted by or under the Constitution or by law, and includes bodies owned, controlled or substantially financed by government, and non-government organisations substantially financed by government funds.",
        citation: { sourceId: "rti", unitNumber: "2", label: "Right to Information Act, 2005, Section 2" }
      },
      {
        text: "Where this Act conflicts with another law, this Act wins. Its provisions have effect notwithstanding anything inconsistent contained in the Official Secrets Act, 1923, and any other law in force at the time. An office cannot refuse a request merely by pointing at an older secrecy provision.",
        citation: { sourceId: "rti", unitNumber: "22", label: "Right to Information Act, 2005, Section 22" }
      },
      {
        text: "The Act does not apply to the intelligence and security organisations listed in its Second Schedule. Two things are carved back out of that exclusion, however: information about allegations of corruption is not excluded at all, and information about allegations of human rights violations may be provided with the approval of the Central Information Commission.",
        citation: { sourceId: "rti", unitNumber: "24", label: "Right to Information Act, 2005, Section 24" }
      }
    ]
  },
  {
    slug: "what-public-authorities-must-publish",
    categoryId: "right-to-information",
    title: "What Offices Must Publish Without Being Asked",
    summary:
      "Public authorities have duties that exist before anyone files a request: keep records properly indexed, publish a defined list of particulars, and designate officers to receive requests.",
    scopeNote:
      "This covers the duties the Act places on the office. It does not cover what happens once you make a request — see the article on making an RTI request.",
    paragraphs: [
      {
        text: "Every public authority must maintain its records duly catalogued and indexed in a form that makes the right to information workable, and must computerise and network records that are appropriate to be computerised, within a reasonable time and subject to available resources. Disorganised records are treated by the Act as a problem the office has to solve, not a reason to refuse you.",
        citation: { sourceId: "rti", unitNumber: "4", label: "Right to Information Act, 2005, Section 4" }
      },
      {
        text: "The same section requires each authority to publish a defined list of particulars about itself — including the particulars of its organisation, functions and duties, the powers and duties of its officers and employees, and the procedure it follows in its decision-making process. This is information you are meant to be able to read without filing anything.",
        citation: { sourceId: "rti", unitNumber: "4", label: "Right to Information Act, 2005, Section 4" }
      },
      {
        text: "Every public authority must designate officers as Central or State Public Information Officers, in all its administrative units or offices, to provide information to people who request it. It must also designate an officer at each sub-divisional or sub-district level to receive applications and appeals for forwarding onward.",
        citation: { sourceId: "rti", unitNumber: "5", label: "Right to Information Act, 2005, Section 5" }
      }
    ]
  },
  {
    slug: "how-to-make-an-rti-request",
    categoryId: "right-to-information",
    title: "How to Make an RTI Request",
    summary:
      "A request goes in writing or electronically, in English, Hindi or the official language of the area, to the Public Information Officer — and you never have to explain why you want it.",
    scopeNote:
      "The Act says a request carries \"such fee as may be prescribed\". The actual amounts are set by rules made under the Act, which are not part of this project's source library, so no figure is given here.",
    paragraphs: [
      {
        text: "A person who wants information under the Act makes a request in writing or through electronic means, in English or Hindi or in the official language of the area where the application is made, accompanied by the prescribed fee. It goes to the Central or State Public Information Officer of the public authority concerned, or to the Assistant Public Information Officer, and it must specify the particulars of the information sought.",
        citation: { sourceId: "rti", unitNumber: "6", label: "Right to Information Act, 2005, Section 6" }
      },
      {
        text: "If you cannot put the request in writing, the Public Information Officer must render you all reasonable assistance to reduce your oral request to writing. Being unable to write is not a barrier the Act leaves you to solve alone.",
        citation: { sourceId: "rti", unitNumber: "6", label: "Right to Information Act, 2005, Section 6" }
      },
      {
        text: "You are not required to give any reason for wanting the information, and not required to give personal details beyond what is necessary to contact you. An officer who demands to know why you want a record is asking for something the Act does not require you to supply.",
        citation: { sourceId: "rti", unitNumber: "6", label: "Right to Information Act, 2005, Section 6" }
      },
      {
        text: "If you send the request to the wrong office, it is not simply rejected. Where the information is held by another public authority, or is more closely connected with another authority's functions, the office that received your application must transfer it — or the relevant part of it — to that authority and tell you immediately. The transfer must happen as soon as practicable and in no case later than five days.",
        citation: { sourceId: "rti", unitNumber: "6", label: "Right to Information Act, 2005, Section 6" }
      }
    ]
  },
  {
    slug: "how-long-an-rti-reply-takes",
    categoryId: "right-to-information",
    title: "How Long an RTI Reply Takes",
    summary:
      "Thirty days as the outer limit, forty-eight hours where life or liberty is concerned, silence counts as a refusal — and if the office misses the deadline the information becomes free.",
    paragraphs: [
      {
        text: "On receiving a request, the Public Information Officer must act as expeditiously as possible and in any case within thirty days, either providing the information on payment of the prescribed fee or rejecting the request for one of the reasons in sections 8 and 9. Thirty days is the outer limit, not the normal service time the Act contemplates.",
        citation: { sourceId: "rti", unitNumber: "7", label: "Right to Information Act, 2005, Section 7" }
      },
      {
        text: "Where the information sought concerns the life or liberty of a person, it must be provided within forty-eight hours of receiving the request. This is a separate, much shorter clock, and it turns on the subject of the information rather than on who is asking.",
        citation: { sourceId: "rti", unitNumber: "7", label: "Right to Information Act, 2005, Section 7" }
      },
      {
        text: "Silence is not a neutral outcome. If the officer fails to give a decision within the specified period, the Act deems the request to have been refused — which means the appeal clock starts running rather than leaving you waiting indefinitely.",
        citation: { sourceId: "rti", unitNumber: "7", label: "Right to Information Act, 2005, Section 7" }
      },
      {
        text: "Missing the deadline also costs the office money rather than you. Where a public authority fails to comply with the time limit, the person who made the request must be provided the information free of charge.",
        citation: { sourceId: "rti", unitNumber: "7", label: "Right to Information Act, 2005, Section 7" }
      },
      {
        text: "Fees have two limits of their own. Any fee prescribed must be reasonable, and no fee may be charged from persons who are below the poverty line as determined by the appropriate Government.",
        citation: { sourceId: "rti", unitNumber: "7", label: "Right to Information Act, 2005, Section 7" }
      }
    ]
  },
  {
    slug: "information-that-can-be-refused",
    categoryId: "right-to-information",
    title: "Information That Can Be Refused",
    summary:
      "The Act lists the specific grounds on which disclosure may be withheld — and several of them fall away when a larger public interest points the other way.",
    scopeNote:
      "This lists grounds the Act itself states. Whether a particular refusal was correctly made on one of these grounds is a decision for the appellate authority or the Information Commission, not something this article can tell you.",
    paragraphs: [
      {
        text: "Section 8 sets out the exemptions. There is no obligation to give information whose disclosure would prejudicially affect the sovereignty and integrity of India, the security, strategic, scientific or economic interests of the State, relations with a foreign State, or lead to incitement of an offence.",
        citation: { sourceId: "rti", unitNumber: "8", label: "Right to Information Act, 2005, Section 8" }
      },
      {
        text: "Other listed grounds include information a court or tribunal has expressly forbidden to be published or whose disclosure would be contempt of court, information whose disclosure would breach the privilege of Parliament or a State Legislature, information received in confidence from a foreign Government, information whose disclosure would endanger someone's life or physical safety or identify a confidential source, and information that would impede an investigation or the apprehension or prosecution of offenders.",
        citation: { sourceId: "rti", unitNumber: "8", label: "Right to Information Act, 2005, Section 8" }
      },
      {
        text: "Two of the exemptions are conditional rather than absolute. Commercial confidence, trade secrets and intellectual property, and information held in a fiduciary relationship, may still be disclosed where the competent authority is satisfied that a larger public interest warrants it.",
        citation: { sourceId: "rti", unitNumber: "8", label: "Right to Information Act, 2005, Section 8" }
      },
      {
        text: "There is one further ground outside section 8. A Public Information Officer may reject a request where giving access would infringe a copyright that belongs to someone other than the State.",
        citation: { sourceId: "rti", unitNumber: "9", label: "Right to Information Act, 2005, Section 9" }
      }
    ]
  },
  {
    slug: "partial-access-and-third-party-information",
    categoryId: "right-to-information",
    title: "Partial Access and Someone Else's Information",
    summary:
      "An exempt paragraph does not make a whole file secret, and where a record concerns a third party, that party gets notice and a say before it is disclosed.",
    paragraphs: [
      {
        text: "Where a request is refused because the information is exempt, access may still be given to the part of the record that does not contain exempt information and can reasonably be severed from the part that does. A single exempt passage is not a reason to withhold an entire document.",
        citation: { sourceId: "rti", unitNumber: "10", label: "Right to Information Act, 2005, Section 10" }
      },
      {
        text: "When only part of a record is released, the officer must give you a notice saying so — telling you that only part of the record is being provided after severance of the exempt material, rather than handing over an edited document without explanation.",
        citation: { sourceId: "rti", unitNumber: "10", label: "Right to Information Act, 2005, Section 10" }
      },
      {
        text: "Where the officer intends to disclose information that relates to or was supplied by a third party and was treated by that party as confidential, the officer must give that third party written notice within five days of receiving the request, stating that disclosure is intended, and invite that party to make a submission on whether it should go ahead.",
        citation: { sourceId: "rti", unitNumber: "11", label: "Right to Information Act, 2005, Section 11" }
      }
    ]
  },
  {
    slug: "appealing-an-rti-refusal",
    categoryId: "right-to-information",
    title: "Appealing an RTI Refusal",
    summary:
      "A first appeal goes within thirty days to an officer senior to the one who decided; a second appeal goes within ninety days to the Information Commission.",
    scopeNote:
      "This describes the appeal route the Act creates. It does not predict how any particular appeal will be decided.",
    paragraphs: [
      {
        text: "A person who does not receive a decision within the time section 7 allows, or who is aggrieved by the Public Information Officer's decision, may appeal within thirty days to an officer senior in rank to that Public Information Officer in the same public authority. Because a missed deadline counts as a deemed refusal, silence is itself appealable.",
        citation: { sourceId: "rti", unitNumber: "19", label: "Right to Information Act, 2005, Section 19" }
      },
      {
        text: "The thirty-day limit is not absolute. The appellate officer may admit an appeal filed later if satisfied that the appellant was prevented by sufficient cause from filing in time.",
        citation: { sourceId: "rti", unitNumber: "19", label: "Right to Information Act, 2005, Section 19" }
      },
      {
        text: "The first appeal must be disposed of within thirty days of its receipt, or within an extended period not exceeding forty-five days in total from the date of filing, for reasons to be recorded in writing.",
        citation: { sourceId: "rti", unitNumber: "19", label: "Right to Information Act, 2005, Section 19" }
      },
      {
        text: "A second appeal lies to the Central Information Commission or the State Information Commission, and must be filed within ninety days from the date on which the first-appeal decision should have been made or was actually received. The Commission may admit a later appeal if satisfied there was sufficient cause for the delay.",
        citation: { sourceId: "rti", unitNumber: "19", label: "Right to Information Act, 2005, Section 19" }
      },
      {
        text: "Where the appeal is against an order under section 11 to disclose third-party information, the third party concerned has thirty days from the date of that order to appeal.",
        citation: { sourceId: "rti", unitNumber: "19", label: "Right to Information Act, 2005, Section 19" }
      }
    ]
  },
  {
    slug: "complaints-and-penalties-under-rti",
    categoryId: "right-to-information",
    title: "Complaints to the Commission, and Penalties on Officers",
    summary:
      "A complaint is a different route from an appeal, and the Commission can impose a daily penalty on a Public Information Officer personally.",
    scopeNote:
      "A complaint under section 18 and an appeal under section 19 are separate routes with different triggers. This article describes what each is for; which one fits a particular situation is a judgement for the person concerned or their adviser.",
    paragraphs: [
      {
        text: "It is the duty of the Central or State Information Commission to receive and inquire into a complaint from a person who has been unable to submit a request at all — because no Public Information Officer was appointed, or because the Assistant Public Information Officer refused to accept the application or appeal for forwarding.",
        citation: { sourceId: "rti", unitNumber: "18", label: "Right to Information Act, 2005, Section 18" }
      },
      {
        text: "Where the Commission, deciding a complaint or an appeal, finds that the Public Information Officer without any reasonable cause refused to receive an application, did not furnish information within the time section 7 specifies, malafidely denied the request, knowingly gave incorrect, incomplete or misleading information, destroyed information that was the subject of the request, or obstructed the furnishing of information in any manner, it must impose a penalty.",
        citation: { sourceId: "rti", unitNumber: "20", label: "Right to Information Act, 2005, Section 20" }
      },
      {
        text: "The penalty is two hundred and fifty rupees for each day until the application is received or the information is furnished, subject to a total ceiling of twenty-five thousand rupees. It falls on the officer, not on the department's budget.",
        citation: { sourceId: "rti", unitNumber: "20", label: "Right to Information Act, 2005, Section 20" }
      },
      {
        text: "The officer is protected procedurally but carries the burden of explanation. He or she must be given a reasonable opportunity of being heard before any penalty is imposed, and the burden of proving that he or she acted reasonably and diligently rests on the officer.",
        citation: { sourceId: "rti", unitNumber: "20", label: "Right to Information Act, 2005, Section 20" }
      }
    ]
  }
];
