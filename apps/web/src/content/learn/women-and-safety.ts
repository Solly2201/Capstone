import type { LearningArticle } from "./types";

// Every article in this category carries a safety-first scope note. The
// subject matter is one people read about while living through it, so the
// pages say plainly that they explain the law and are not a safety plan.
const safetyNote =
  "This explains what the law provides. It is not a safety plan and not advice for a specific situation. If someone is in danger right now, contacting the police on 112, or the Women's Helpline on 181, comes before anything on this page.";

export const womenAndSafetyArticles: LearningArticle[] = [
  {
    slug: "what-is-domestic-violence",
    categoryId: "women-and-safety",
    title: "What the Law Means by Domestic Violence",
    summary:
      "The statutory definition of domestic violence, the four kinds of abuse it names, and who counts as an aggrieved person in a domestic relationship.",
    paragraphs: [
      {
        text: "The Protection of Women from Domestic Violence Act defines domestic violence far more widely than physical assault. Any act, omission, commission or conduct of the respondent constitutes domestic violence if it harms, injures or endangers the health, safety, life, limb or well-being — mental or physical — of the aggrieved person, or tends to do so, and this expressly includes causing physical abuse, sexual abuse, verbal and emotional abuse, and economic abuse.",
        citation: { sourceId: "pwdva", unitNumber: "3", label: "Protection of Women from Domestic Violence Act, Section 3(a)" }
      },
      {
        text: "Dowry-related harassment is named separately. Conduct that harasses, harms, injures or endangers the aggrieved person in order to coerce her, or any person related to her, into meeting an unlawful demand for dowry or other property or valuable security is domestic violence, as is conduct that has the effect of threatening her or a person related to her by such means.",
        citation: { sourceId: "pwdva", unitNumber: "3", label: "Protection of Women from Domestic Violence Act, Section 3(b)-(c)" }
      },
      {
        text: "The Act then explains each kind of abuse. Physical abuse means conduct causing bodily pain, harm or danger to life, limb or health, or impairing health or development, and includes assault, criminal intimidation and criminal force. Sexual abuse includes conduct of a sexual nature that abuses, humiliates, degrades or otherwise violates a woman's dignity.",
        citation: { sourceId: "pwdva", unitNumber: "3", label: "Protection of Women from Domestic Violence Act, Section 3, Explanation I(i)-(ii)" }
      },
      {
        text: "Verbal and emotional abuse includes insults, ridicule, humiliation and name-calling — the Act specifically mentions insults about not having a child or a male child — and repeated threats to cause physical pain to any person the aggrieved person cares about.",
        citation: { sourceId: "pwdva", unitNumber: "3", label: "Protection of Women from Domestic Violence Act, Section 3, Explanation I(iii)" }
      },
      {
        text: "Economic abuse is recognised as abuse in its own right. It includes depriving the aggrieved person of economic or financial resources she is entitled to by law, custom or necessity — household necessities for her and her children, stridhan, property, rent for the shared household, and maintenance — and the disposal of household effects or alienation of assets.",
        citation: { sourceId: "pwdva", unitNumber: "3", label: "Protection of Women from Domestic Violence Act, Section 3, Explanation I(iv)" }
      },
      {
        text: "Two definitions decide who the Act covers. An aggrieved person is any woman who is, or has been, in a domestic relationship with the respondent and who alleges she has been subjected to domestic violence. A domestic relationship means a relationship between two people who live, or have at any point lived, together in a shared household, where they are related by consanguinity, marriage, a relationship in the nature of marriage, adoption, or are family members living together as a joint family.",
        citation: { sourceId: "pwdva", unitNumber: "2", label: "Protection of Women from Domestic Violence Act, Sections 2(a) and 2(f)" }
      }
    ],
    scopeNote: safetyNote
  },
  {
    slug: "protection-officers-and-first-response",
    categoryId: "women-and-safety",
    title: "Protection Officers and Who Must Tell You Your Rights",
    summary:
      "Who can report domestic violence, the duty on police and others to inform an aggrieved person of her options, and what a Protection Officer does.",
    paragraphs: [
      {
        text: "Reporting is open to anyone, not only the person affected. Any person who has reason to believe that an act of domestic violence has been, is being, or is likely to be committed may give information about it to the concerned Protection Officer.",
        citation: { sourceId: "pwdva", unitNumber: "4", label: "Protection of Women from Domestic Violence Act, Section 4(1)" }
      },
      {
        text: "Someone who reports in good faith is protected. No liability, civil or criminal, is incurred by any person for giving such information in good faith.",
        citation: { sourceId: "pwdva", unitNumber: "4", label: "Protection of Women from Domestic Violence Act, Section 4(2)" }
      },
      {
        text: "There is a positive duty to explain the options. A police officer, Protection Officer, service provider or Magistrate who receives a complaint of domestic violence — or is otherwise present at the place of an incident, or has it reported to them — must inform the aggrieved person of her right to apply for a protection order, a monetary relief order, a custody order, a residence order or a compensation order; of the availability of service providers and Protection Officers; of her right to free legal services under the Legal Services Authorities Act, 1987; and, where relevant, of her right to file a criminal complaint.",
        citation: { sourceId: "pwdva", unitNumber: "5", label: "Protection of Women from Domestic Violence Act, Section 5" }
      },
      {
        text: "That duty does not replace ordinary policing. The Act expressly says nothing in it relieves a police officer of the duty to proceed in accordance with law on receiving information about the commission of a cognizable offence.",
        citation: { sourceId: "pwdva", unitNumber: "5", label: "Protection of Women from Domestic Violence Act, Section 5, proviso" }
      },
      {
        text: "The Protection Officer is the practical link to the court. On receiving a complaint, the Officer makes a domestic incident report to the Magistrate and forwards copies to the police station and to service providers in the area; applies to the Magistrate for a protection order if the aggrieved person so desires; ensures she is provided legal aid under the Legal Services Authorities Act and gives her the prescribed complaint form free of cost; and maintains a list of service providers, shelter homes and medical facilities in the area.",
        citation: { sourceId: "pwdva", unitNumber: "9", label: "Protection of Women from Domestic Violence Act, Section 9(1)(b)-(e)" }
      },
      {
        text: "The Officer's duties extend to immediate practical help: making a safe shelter home available if the aggrieved person requires it, and getting her medically examined if she has sustained bodily injuries — forwarding a copy of the report or medical report to the police station and the Magistrate in each case. The Officer also ensures a monetary relief order is complied with and executed.",
        citation: { sourceId: "pwdva", unitNumber: "9", label: "Protection of Women from Domestic Violence Act, Section 9(1)(f)-(h)" }
      }
    ],
    scopeNote: safetyNote
  },
  {
    slug: "orders-a-magistrate-can-pass",
    categoryId: "women-and-safety",
    title: "Orders a Magistrate Can Pass",
    summary:
      "Protection, residence, monetary relief, custody and compensation orders under the domestic violence legislation, and the right to reside in a shared household.",
    paragraphs: [
      {
        text: "The application can come from the woman herself or from someone acting for her. An aggrieved person, a Protection Officer, or any other person on her behalf may apply to the Magistrate seeking one or more reliefs under the Act. The Magistrate fixes the first hearing date, ordinarily not beyond three days from receiving the application, and is to endeavour to dispose of the application within sixty days of that first hearing.",
        citation: { sourceId: "pwdva", unitNumber: "12", label: "Protection of Women from Domestic Violence Act, Section 12(1), (4), (5)" }
      },
      {
        text: "One right does not depend on any order at all. Every woman in a domestic relationship has the right to reside in the shared household, whether or not she has any right, title or beneficial interest in it, and she cannot be evicted or excluded from it by the respondent except in accordance with the procedure established by law.",
        citation: { sourceId: "pwdva", unitNumber: "17", label: "Protection of Women from Domestic Violence Act, Section 17" }
      },
      {
        text: "A protection order prohibits specified conduct. After hearing both sides and on being prima facie satisfied that domestic violence has taken place or is likely to, the Magistrate may prohibit the respondent from committing or abetting domestic violence; entering her place of employment or, for a child, its school; attempting to communicate with her in any form including telephonic or electronic contact; alienating assets or operating joint bank accounts or lockers, including her stridhan, without the Magistrate's leave; and causing violence to her dependants, relatives or anyone assisting her.",
        citation: { sourceId: "pwdva", unitNumber: "18", label: "Protection of Women from Domestic Violence Act, Section 18" }
      },
      {
        text: "A residence order deals with the house itself. The Magistrate may restrain the respondent from dispossessing or disturbing her possession of the shared household — whether or not he has a legal or equitable interest in it — direct him to remove himself from it, restrain him or his relatives from entering the portion where she resides, restrain him from alienating or encumbering it, or direct him to secure alternate accommodation of the same level, or pay rent for it. An order directing removal from the household cannot be passed against a woman.",
        citation: { sourceId: "pwdva", unitNumber: "19", label: "Protection of Women from Domestic Violence Act, Section 19(1)" }
      },
      {
        text: "Monetary relief covers the cost of what happened. The Magistrate may direct the respondent to pay for expenses incurred and losses suffered by the aggrieved person and her children, including loss of earnings, medical expenses, loss caused by destruction or removal of property, and maintenance. The relief must be adequate, fair and reasonable and consistent with the standard of living she is accustomed to, and where the respondent fails to pay, the Magistrate may direct his employer or debtor to pay a portion of his wages or salary directly.",
        citation: { sourceId: "pwdva", unitNumber: "20", label: "Protection of Women from Domestic Violence Act, Section 20" }
      },
      {
        text: "Two further orders complete the set. At any stage of the hearing the Magistrate may grant temporary custody of a child to the aggrieved person or her representative, specifying arrangements for the respondent's visits — and must refuse a visit that would be harmful to the child's interests. Separately, the Magistrate may order compensation and damages for injuries including mental torture and emotional distress.",
        citation: { sourceId: "pwdva", unitNumber: "21", label: "Protection of Women from Domestic Violence Act, Sections 21 and 22" }
      },
      {
        text: "Relief need not wait for a full hearing. In any proceeding the Magistrate may pass an interim order as he deems just and proper, and where an application prima facie discloses that the respondent is committing or has committed domestic violence, or that he is likely to, the Magistrate may grant an ex parte order on the basis of the aggrieved person's affidavit.",
        citation: { sourceId: "pwdva", unitNumber: "23", label: "Protection of Women from Domestic Violence Act, Section 23" }
      }
    ],
    scopeNote: safetyNote
  },
  {
    slug: "breach-of-a-protection-order",
    categoryId: "women-and-safety",
    title: "What Happens If an Order Is Breached",
    summary:
      "The offence of breaching a protection order, how long orders last, and the privacy and appeal provisions that go with them.",
    paragraphs: [
      {
        text: "Breaching an order is itself a crime. A breach of a protection order, or of an interim protection order, by the respondent is an offence under the Act, punishable with imprisonment of either description for a term which may extend to one year, or a fine which may extend to twenty thousand rupees, or both.",
        citation: { sourceId: "pwdva", unitNumber: "31", label: "Protection of Women from Domestic Violence Act, Section 31(1)" }
      },
      {
        text: "The case goes back to the judge who knows it. As far as practicable, the offence is tried by the Magistrate who passed the order alleged to have been breached, and while framing charges that Magistrate may also frame charges under other criminal provisions if the facts disclose those offences.",
        citation: { sourceId: "pwdva", unitNumber: "31", label: "Protection of Women from Domestic Violence Act, Section 31(2)-(3)" }
      },
      {
        text: "The aggrieved person's own account carries weight at that stage. Upon the sole testimony of the aggrieved person, the court may conclude that an offence of breach has been committed by the accused.",
        citation: { sourceId: "pwdva", unitNumber: "32", label: "Protection of Women from Domestic Violence Act, Section 32(2)" }
      },
      {
        text: "The duty on officials is enforceable too. A Protection Officer who fails or refuses to discharge duties directed by the Magistrate, without sufficient cause, is punishable with imprisonment which may extend to one year, or a fine which may extend to twenty thousand rupees, or both.",
        citation: { sourceId: "pwdva", unitNumber: "33", label: "Protection of Women from Domestic Violence Act, Section 33" }
      },
      {
        text: "Orders are not necessarily permanent. A protection order remains in force until the aggrieved person applies for its discharge, and the Magistrate may alter, modify or revoke any order under the Act on being satisfied there is a change in circumstances, recording reasons in writing.",
        citation: { sourceId: "pwdva", unitNumber: "25", label: "Protection of Women from Domestic Violence Act, Section 25" }
      },
      {
        text: "Two procedural protections are worth knowing. Proceedings under the Act may be held in camera if either party so desires and the Magistrate considers it appropriate, and the court gives copies of its order free of cost to the parties, the police station and any service provider concerned. An appeal against a Magistrate's order lies to the Court of Session within thirty days of the order being served.",
        citation: { sourceId: "pwdva", unitNumber: "29", label: "Protection of Women from Domestic Violence Act, Sections 16, 24 and 29" }
      }
    ],
    scopeNote: safetyNote
  }
];
