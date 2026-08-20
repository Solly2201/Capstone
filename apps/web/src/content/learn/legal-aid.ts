import type { LearningArticle } from "./types";

export const legalAidArticles: LearningArticle[] = [
  {
    slug: "free-legal-aid",
    categoryId: "legal-aid",
    title: "Who Is Entitled to Free Legal Aid",
    summary:
      "The categories of people the Legal Services Authorities Act entitles to free legal services, and what an Authority checks before providing them.",
    paragraphs: [
      {
        text: "Free legal services are an entitlement for listed categories of people, not a favour. Every person who has to file or defend a case is entitled to legal services under the Act if they are a member of a Scheduled Caste or Scheduled Tribe; a victim of trafficking in human beings or begar as referred to in Article 23 of the Constitution; a woman or a child; a person with disability; a person in circumstances of undeserved want such as a victim of a mass disaster, ethnic violence, caste atrocity, flood, drought, earthquake or industrial disaster; an industrial workman; or a person in custody, including in a protective home, juvenile home, or psychiatric hospital or nursing home.",
        citation: { sourceId: "lsa", unitNumber: "12", label: "Legal Services Authorities Act, Section 12" }
      },
      {
        text: "There is also an income criterion, set at an amount that may be raised by the State Government for cases before courts other than the Supreme Court, and by the Central Government for cases before the Supreme Court.",
        citation: { sourceId: "lsa", unitNumber: "12", label: "Legal Services Authorities Act, Section 12(h)" }
      },
      {
        text: "Meeting any one of those criteria is enough — the Act says persons who satisfy all or any of them are entitled. But the Authority must also be satisfied that the person has a prima facie case to prosecute or defend.",
        citation: { sourceId: "lsa", unitNumber: "13", label: "Legal Services Authorities Act, Section 13(1)" }
      },
      {
        text: "Proving income is deliberately made easy. An affidavit made by a person as to their income may be regarded as sufficient to make them eligible for legal services, unless the concerned Authority has reason to disbelieve that affidavit.",
        citation: { sourceId: "lsa", unitNumber: "13", label: "Legal Services Authorities Act, Section 13(2)" }
      },
      {
        text: "The entitlement is echoed elsewhere in the law rather than left to be discovered. Under the domestic violence legislation, for example, a police officer, Protection Officer, service provider or Magistrate who receives a complaint must inform the aggrieved person of her right to free legal services under this Act.",
        citation: { sourceId: "pwdva", unitNumber: "5", label: "Protection of Women from Domestic Violence Act, Section 5(d)" }
      }
    ],
    scopeNote:
      "The specific income limits in section 12(h) are set by government notification and change over time; the figures printed in the ingested text are the ones originally enacted, so check the current limit with your District Legal Services Authority rather than relying on a number quoted here."
  },
  {
    slug: "legal-services-authorities",
    categoryId: "legal-aid",
    title: "The Legal Services Authorities",
    summary:
      "The national, State, district and taluk bodies that actually deliver legal aid, and what each of them is required to do.",
    paragraphs: [
      {
        text: "The Act builds a chain of authorities rather than a single office. At the top, the Central Authority lays down policies and principles for making legal services available, frames schemes for delivering them, allocates funds to State and District Authorities, and monitors and evaluates how legal aid programmes are actually implemented.",
        citation: { sourceId: "lsa", unitNumber: "4", label: "Legal Services Authorities Act, Section 4" }
      },
      {
        text: "Its functions go beyond running cases. The Central Authority organises legal aid camps, especially in rural areas, slums and labour colonies, both to educate weaker sections about their rights and to encourage settlement through Lok Adalats; encourages settlement by negotiation, arbitration and conciliation; develops clinical legal education programmes in consultation with the Bar Council of India; and takes measures for spreading legal literacy and legal awareness.",
        citation: { sourceId: "lsa", unitNumber: "4", label: "Legal Services Authorities Act, Section 4(e), (f), (k), (l)" }
      },
      {
        text: "There are dedicated committees at the two constitutional courts. The Central Authority constitutes a Supreme Court Legal Services Committee, chaired by a sitting Judge of the Supreme Court, and each State Authority constitutes a High Court Legal Services Committee for its High Court, chaired by a sitting Judge of that High Court.",
        citation: { sourceId: "lsa", unitNumber: "3A", label: "Legal Services Authorities Act, Sections 3A and 8A" }
      },
      {
        text: "At State level, the State Authority must give effect to the Central Authority's policy and directions, give legal services to persons who satisfy the Act's criteria, conduct Lok Adalats including Lok Adalats for High Court cases, and undertake preventive and strategic legal aid programmes.",
        citation: { sourceId: "lsa", unitNumber: "7", label: "Legal Services Authorities Act, Section 7" }
      },
      {
        text: "The body most citizens will actually deal with is the District Legal Services Authority, constituted for every district by the State Government in consultation with the Chief Justice of the High Court. The District Judge is its Chairman, and a judicial officer not below the rank of a Subordinate Judge or Civil Judge is appointed as its Secretary.",
        citation: { sourceId: "lsa", unitNumber: "9", label: "Legal Services Authorities Act, Section 9" }
      },
      {
        text: "Its job is delivery on the ground: performing the State Authority's functions as delegated to it in the district, coordinating the activities of the Taluk Legal Services Committee and other legal services in the district, and organising Lok Adalats within the district. Below it, a Taluk Legal Services Committee coordinates legal services in the taluk and organises Lok Adalats there.",
        citation: { sourceId: "lsa", unitNumber: "10", label: "Legal Services Authorities Act, Sections 10 and 11B" }
      }
    ]
  },
  {
    slug: "lok-adalats",
    categoryId: "legal-aid",
    title: "Lok Adalats",
    summary:
      "How a case reaches a Lok Adalat, how it is decided, what its award means, and what happens when no settlement is reached.",
    paragraphs: [
      {
        text: "A Lok Adalat is a settlement forum, and a case reaches it in one of three ways: the parties agree to refer it; one party applies and the court is prima facie satisfied there are chances of settlement; or the court is satisfied on its own that the matter is an appropriate one for a Lok Adalat. In the last two situations the court must first give the parties a reasonable opportunity of being heard.",
        citation: { sourceId: "lsa", unitNumber: "20", label: "Legal Services Authorities Act, Section 20(1)" }
      },
      {
        text: "A matter can also come to a Lok Adalat without a court case. The Authority or Committee organising the Lok Adalat may, on an application from one of the parties, refer a pre-litigation matter to it for determination — again only after giving the other party a reasonable opportunity of being heard.",
        citation: { sourceId: "lsa", unitNumber: "20", label: "Legal Services Authorities Act, Section 20(2)" }
      },
      {
        text: "The standard it applies is not the strict law of procedure. Every Lok Adalat, while determining a reference, must act with utmost expedition to arrive at a compromise or settlement, and is guided by the principles of justice, equity, fair play and other legal principles.",
        citation: { sourceId: "lsa", unitNumber: "20", label: "Legal Services Authorities Act, Section 20(4)" }
      },
      {
        text: "For the purposes of holding a determination, a Lok Adalat has the same powers as a Civil Court under the Code of Civil Procedure, 1908 in matters such as summoning and enforcing the attendance of a witness and examining them on oath, discovery and production of documents, receiving evidence on affidavits, and requisitioning public records. It may also specify its own procedure, and its proceedings are deemed to be judicial proceedings.",
        citation: { sourceId: "lsa", unitNumber: "21", label: "Legal Services Authorities Act, Section 22" }
      },
      {
        text: "The outcome is binding, and it is cheap. Every award of a Lok Adalat is deemed to be a decree of a civil court or an order of the relevant court, and where a compromise or settlement is arrived at in a referred case, the court fee paid in that case is refunded. Every award is final and binding on all the parties, and no appeal lies to any court against it.",
        citation: { sourceId: "lsa", unitNumber: "21", label: "Legal Services Authorities Act, Section 21" }
      },
      {
        text: "Nothing is lost if the parties do not settle. Where no award is made because no compromise could be reached, the record of a court-referred case is returned to the court, which then proceeds from the stage the case had reached before the reference. In a pre-litigation matter, the Lok Adalat advises the parties to seek their remedy in a court.",
        citation: { sourceId: "lsa", unitNumber: "20", label: "Legal Services Authorities Act, Section 20(5)-(7)" }
      }
    ],
    scopeNote:
      "Because a Lok Adalat award is final and cannot be appealed, agreeing to a settlement there is a significant decision. Whether a particular settlement is a good one is exactly the kind of question to put to a lawyer or to the Authority organising the Lok Adalat."
  },
  {
    slug: "permanent-lok-adalats",
    categoryId: "legal-aid",
    title: "Permanent Lok Adalats for Public Utility Services",
    summary:
      "A separate forum for disputes about transport, post, power, water, sanitation, hospitals and insurance — with a value limit and a settlement-first procedure.",
    paragraphs: [
      {
        text: "Permanent Lok Adalats exist for a defined set of everyday services. A public utility service, for this purpose, means transport for passengers or goods by air, road or water; postal, telegraph or telephone service; the supply of power, light or water to the public; a system of public conservancy or sanitation; service in a hospital or dispensary; or insurance service — and the Government may notify other services into the list.",
        citation: { sourceId: "lsa", unitNumber: "22A", label: "Legal Services Authorities Act, Section 22A" }
      },
      {
        text: "The Central and State Authorities establish these Permanent Lok Adalats for the areas they specify, to exercise jurisdiction over disputes about those services.",
        citation: { sourceId: "lsa", unitNumber: "22B", label: "Legal Services Authorities Act, Section 22B" }
      },
      {
        text: "The forum is meant to be reached before litigation. Any party to a dispute may apply to the Permanent Lok Adalat before the dispute is brought before any court. Once that application is made, no party to it may invoke the jurisdiction of any court in the same dispute.",
        citation: { sourceId: "lsa", unitNumber: "22C", label: "Legal Services Authorities Act, Section 22C(1)-(2)" }
      },
      {
        text: "Two limits are written in. The Permanent Lok Adalat has no jurisdiction over a matter relating to an offence that is not compoundable under any law, and none where the value of the property in dispute exceeds ten lakh rupees — a figure the Central Government may raise by notification in consultation with the Central Authority.",
        citation: { sourceId: "lsa", unitNumber: "22C", label: "Legal Services Authorities Act, Section 22C(1), provisos" }
      },
      {
        text: "The procedure starts with conciliation. Each party files a written statement of the facts, the issues and the grounds relied on, with any supporting documents, and copies go to the other side. The Permanent Lok Adalat then conducts conciliation proceedings, assisting the parties to reach an amicable settlement in an independent and impartial manner, and every party has a duty to cooperate in good faith.",
        citation: { sourceId: "lsa", unitNumber: "22C", label: "Legal Services Authorities Act, Section 22C(3)-(6)" }
      },
      {
        text: "Its award is final in a strong sense. Every award, whether made on merit or in terms of a settlement agreement, is final and binding on all the parties and on persons claiming under them; is deemed to be a decree of a civil court; is made by a majority of the persons constituting the Permanent Lok Adalat; and cannot be called in question in any original suit, application or execution proceeding. The award may be transmitted to a civil court with local jurisdiction, which executes it as if it were its own decree.",
        citation: { sourceId: "lsa", unitNumber: "22E", label: "Legal Services Authorities Act, Section 22E" }
      }
    ],
    scopeNote:
      "Choosing this route closes the door to a court on the same dispute, and the award cannot be appealed. That trade-off is worth discussing with a lawyer or with the District Legal Services Authority before applying."
  }
];
