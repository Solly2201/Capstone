import type { LearningArticle } from "./types";

export const consumerRightsArticles: LearningArticle[] = [
  {
    slug: "consumer-rights-basics",
    categoryId: "consumer-rights",
    title: "Who Counts as a Consumer",
    summary:
      "Who counts as a consumer, the rights the Consumer Protection Act names, and where a consumer complaint is filed.",
    paragraphs: [
      {
        text: "A consumer is a person who buys goods, or hires or avails of a service, for a consideration that has been paid or promised — including under deferred payment. It also covers a user or beneficiary other than the buyer, where the use is with the buyer's approval. It does not cover a person who obtains goods for resale or for any commercial purpose, or who avails of a service for a commercial purpose.",
        citation: { sourceId: "cpa2019", unitNumber: "2", label: "Consumer Protection Act, Section 2(7)" }
      },
      {
        text: "The Act names consumer rights directly. They include the right to be protected against the marketing of goods, products or services hazardous to life and property; the right to be informed about quality, quantity, potency, purity, standard and price so as to be protected against unfair trade practices; the right to be assured, wherever possible, of access to a variety of goods, products or services at competitive prices; the right to be heard and to be assured that consumer interests will receive due consideration at appropriate fora; the right to seek redressal against unfair or restrictive trade practices or unscrupulous exploitation; and the right to consumer awareness.",
        citation: { sourceId: "cpa2019", unitNumber: "2", label: "Consumer Protection Act, Section 2(9)" }
      },
      {
        text: "Two terms decide most complaints. A defect is any fault, imperfection or shortcoming in the quality, quantity, potency, purity or standard of goods required to be maintained by law, by contract, or as claimed by the trader. A deficiency is any fault, imperfection, shortcoming or inadequacy in the quality, nature and manner of performance of a service, and it expressly includes an act of negligence or omission causing loss or injury to the consumer, and the deliberate withholding of relevant information from the consumer.",
        citation: { sourceId: "cpa2019", unitNumber: "2", label: "Consumer Protection Act, Sections 2(10)-(11)" }
      },
      {
        text: "An unfair trade practice is defined by example rather than in the abstract. It covers a trade practice that, to promote a sale or a service, adopts an unfair or deceptive method — including falsely representing that goods are of a particular standard, quality, quantity, grade, composition, style or model; falsely representing that services are of a particular standard or grade; passing off rebuilt, second-hand, renovated or reconditioned goods as new; and representing that goods or services have sponsorship, approval, performance, characteristics, accessories, uses or benefits they do not have.",
        citation: { sourceId: "cpa2019", unitNumber: "2", label: "Consumer Protection Act, Section 2(47)" }
      },
      {
        text: "The Act also names the one-sided contract as a problem in itself. An unfair contract is one between a manufacturer, trader or service provider and a consumer whose terms cause a significant change in the consumer's rights — for example requiring manifestly excessive security deposits, imposing a penalty for breach that is wholly disproportionate to the loss, refusing early repayment of a debt on payment of the applicable penalty, or allowing one party to terminate the contract unilaterally without reasonable cause.",
        citation: { sourceId: "cpa2019", unitNumber: "2", label: "Consumer Protection Act, Section 2(46)" }
      },
      {
        text: "Using this Act does not shut other doors. Its provisions are in addition to, and not in derogation of, the provisions of any other law for the time being in force.",
        citation: { sourceId: "cpa2019", unitNumber: "100", label: "Consumer Protection Act, Section 100" }
      }
    ],
    scopeNote:
      "This explains the general categories the Act uses. Whether a particular purchase, service or contract term falls inside them is a judgement about facts, and that judgement belongs to a Consumer Commission — not to a summary like this one."
  },
  {
    slug: "where-to-file-a-consumer-complaint",
    categoryId: "consumer-rights",
    title: "Where a Consumer Complaint Is Filed",
    summary:
      "The three-tier Commission structure, the value limits that decide which one hears your case, where it must be filed, and the two-year time limit.",
    paragraphs: [
      {
        text: "Consumer disputes are heard by a three-tier structure: a District Consumer Disputes Redressal Commission, a State Commission, and the National Commission. Which one hears a complaint depends mainly on the value of the goods or services paid as consideration.",
        citation: { sourceId: "cpa2019", unitNumber: "28", label: "Consumer Protection Act, Section 28" }
      },
      {
        text: "The District Commission entertains complaints where the value of the goods or services paid as consideration does not exceed one crore rupees. The Central Government may prescribe a different value if it thinks it necessary.",
        citation: { sourceId: "cpa2019", unitNumber: "34", label: "Consumer Protection Act, Section 34(1)" }
      },
      {
        text: "Location matters as much as value. A complaint is instituted in the District Commission within whose local limits the opposite party ordinarily resides, carries on business, has a branch office or personally works for gain; or where the cause of action arises wholly or in part; or where the complainant resides or personally works for gain. That last ground is the one that lets a consumer file close to home rather than travelling to the seller.",
        citation: { sourceId: "cpa2019", unitNumber: "34", label: "Consumer Protection Act, Section 34(2)" }
      },
      {
        text: "The State Commission entertains complaints where the consideration exceeds one crore rupees but does not exceed ten crore rupees, complaints against unfair contracts up to ten crore rupees, and appeals against orders of District Commissions in the State. It can also call for the record of a case decided by a District Commission that exercised a jurisdiction it did not have, failed to exercise one it did have, or acted illegally or with material irregularity.",
        citation: { sourceId: "cpa2019", unitNumber: "47", label: "Consumer Protection Act, Section 47(1)" }
      },
      {
        text: "The National Commission entertains complaints where the consideration exceeds ten crore rupees, complaints against unfair contracts above that value, appeals against State Commission orders, and appeals against orders of the Central Consumer Protection Authority.",
        citation: { sourceId: "cpa2019", unitNumber: "58", label: "Consumer Protection Act, Section 58(1)" }
      },
      {
        text: "There is a time limit, and it is short. A District, State or National Commission shall not admit a complaint unless it is filed within two years from the date on which the cause of action arose. A later complaint can still be entertained if the complainant satisfies the Commission that there was sufficient cause for the delay, and the Commission records its reasons for condoning it.",
        citation: { sourceId: "cpa2019", unitNumber: "69", label: "Consumer Protection Act, Section 69" }
      }
    ],
    scopeNote:
      "The value limits above are the ones in the enacted text; the Act allows the Central Government to prescribe different values by notification, so confirm the current figure before relying on it. Which tier fits a specific dispute is a question about that dispute's facts."
  },
  {
    slug: "how-a-consumer-case-proceeds",
    categoryId: "consumer-rights",
    title: "How a Consumer Case Proceeds",
    summary:
      "Who may file, what happens after a complaint is admitted, the reliefs a Commission can order, and how an order is appealed and enforced.",
    paragraphs: [
      {
        text: "A complaint about goods sold or delivered, or a service provided or agreed to be provided, may be filed with a District Commission by the consumer concerned, by a recognised consumer association whether or not the consumer is a member, by numerous consumers with the same interest with the Commission's permission, or by the Central Government, the Central Authority or a State Government. The Act expressly allows the complaint to be filed electronically in the prescribed manner.",
        citation: { sourceId: "cpa2019", unitNumber: "35", label: "Consumer Protection Act, Section 35(1)" }
      },
      {
        text: "Admission is meant to be quick. On receiving a complaint, the District Commission may admit it or reject it — but it cannot reject it without giving the complainant an opportunity of being heard, and admissibility is ordinarily to be decided within twenty-one days of filing. If the Commission does not decide admissibility within that period, the complaint is deemed to have been admitted.",
        citation: { sourceId: "cpa2019", unitNumber: "36", label: "Consumer Protection Act, Section 36(2)-(3)" }
      },
      {
        text: "Once a complaint about goods is admitted, a copy goes to the opposite party within twenty-one days, with a direction to give their version within thirty days, extendable by up to fifteen more days. Where the alleged defect cannot be determined without a proper analysis, the Commission takes a sealed sample and refers it to an appropriate laboratory, which reports back within forty-five days or such extended period as the Commission grants. Both sides get a reasonable opportunity of being heard on the laboratory's findings.",
        citation: { sourceId: "cpa2019", unitNumber: "38", label: "Consumer Protection Act, Section 38(2)" }
      },
      {
        text: "The reliefs a Commission can order are wide. They include removing the defect, replacing the goods with new goods free from defect, returning the price or charges paid with interest, paying compensation for loss or injury caused by the opposite party's negligence, removing deficiencies in a service, discontinuing an unfair or restrictive trade practice, withdrawing hazardous goods from sale, issuing a corrective advertisement at the offender's cost, and providing adequate costs to the parties. The Commission also has the power to grant punitive damages where it thinks fit.",
        citation: { sourceId: "cpa2019", unitNumber: "39", label: "Consumer Protection Act, Section 39(1)" }
      },
      {
        text: "An appeal against a District Commission order lies to the State Commission, on facts or law, within forty-five days of the order — extendable if the State Commission is satisfied there was sufficient cause for the delay. A person ordered to pay an amount cannot appeal unless they first deposit fifty per cent of it. No appeal lies from an order simply recording a mediated settlement.",
        citation: { sourceId: "cpa2019", unitNumber: "41", label: "Consumer Protection Act, Section 41" }
      },
      {
        text: "At the top of the chain, an appeal against a National Commission order made in its original complaint jurisdiction lies to the Supreme Court within thirty days, again subject to the fifty per cent deposit rule for a person ordered to pay.",
        citation: { sourceId: "cpa2019", unitNumber: "67", label: "Consumer Protection Act, Section 67" }
      },
      {
        text: "An order is not just a piece of paper. Every order of a District, State or National Commission is enforced by it as if it were a decree of a civil court. Failing to comply with an order is an offence punishable with imprisonment of not less than one month and up to three years, or a fine of not less than twenty-five thousand rupees and up to one lakh rupees, or both.",
        citation: { sourceId: "cpa2019", unitNumber: "72", label: "Consumer Protection Act, Sections 71-72" }
      }
    ],
    scopeNote:
      "This describes the procedure the Act lays down. It is not a guide to drafting a complaint, calculating what to claim, or arguing a particular case — a consumer forum's own registry or a lawyer can help with those."
  },
  {
    slug: "consumer-mediation",
    categoryId: "consumer-rights",
    title: "Consumer Mediation",
    summary:
      "The mediation route built into the Consumer Protection Act: when a Commission can refer a dispute, how mediation runs, and what a settlement means.",
    paragraphs: [
      {
        text: "Mediation is offered from inside the case, not as an alternative to it. At the first hearing after a complaint is admitted, or at any later stage, if the District Commission sees elements of a settlement that may be acceptable to the parties, it may direct them to give written consent within five days to have the dispute settled by mediation.",
        citation: { sourceId: "cpa2019", unitNumber: "37", label: "Consumer Protection Act, Section 37(1)" }
      },
      {
        text: "Consent is required, and the referral is fast. Where the parties agree and give written consent, the Commission refers the matter for mediation within five days of receiving that consent.",
        citation: { sourceId: "cpa2019", unitNumber: "37", label: "Consumer Protection Act, Section 37(2)" }
      },
      {
        text: "The forum is a permanent one. Each State Government establishes a consumer mediation cell attached to every District Commission and State Commission in the State, and the Central Government does the same for the National Commission and each of its regional Benches. Every cell keeps a list of empanelled mediators and a record of proceedings.",
        citation: { sourceId: "cpa2019", unitNumber: "74", label: "Consumer Protection Act, Section 74" }
      },
      {
        text: "Mediation is held in the cell attached to the Commission concerned. The nominated mediator must have regard to the rights and obligations of the parties, the usages of trade, and the circumstances that gave rise to the dispute, and is guided by the principles of natural justice.",
        citation: { sourceId: "cpa2019", unitNumber: "79", label: "Consumer Protection Act, Section 79" }
      },
      {
        text: "If agreement is reached on all or some of the issues, the terms are reduced to writing and signed by the parties or their authorised representatives, and the mediator sends the signed agreement with a settlement report to the Commission. If no agreement is reached within the specified time, or the mediator concludes settlement is not possible, the mediator reports that instead.",
        citation: { sourceId: "cpa2019", unitNumber: "80", label: "Consumer Protection Act, Section 80" }
      },
      {
        text: "The Commission then closes the loop. Within seven days of receiving the settlement report it passes an order recording the settlement and disposes of the matter. Where only part of the dispute settled, it records that part and continues to hear the rest; where mediation failed entirely, it continues to hear all the issues.",
        citation: { sourceId: "cpa2019", unitNumber: "81", label: "Consumer Protection Act, Section 81" }
      }
    ]
  },
  {
    slug: "product-liability",
    categoryId: "consumer-rights",
    title: "Product Liability",
    summary:
      "When a manufacturer, service provider or seller is answerable for harm caused by a defective product — and the exceptions the Act writes in.",
    paragraphs: [
      {
        text: "Product liability is the responsibility of a product manufacturer or product seller to compensate for harm caused to a consumer by a defective product, or by a deficiency in services relating to it. A product liability action is a complaint filed before a District, State or National Commission claiming compensation for that harm.",
        citation: { sourceId: "cpa2019", unitNumber: "2", label: "Consumer Protection Act, Sections 2(34)-(35)" }
      },
      {
        text: "The action can be brought against any of three parties: a product manufacturer, a product service provider, or a product seller, for any harm caused by a defective product.",
        citation: { sourceId: "cpa2019", unitNumber: "83", label: "Consumer Protection Act, Section 83" }
      },
      {
        text: "A manufacturer is liable if the product contains a manufacturing defect, is defective in design, deviates from manufacturing specifications, does not conform to an express warranty, or fails to carry adequate instructions for correct usage to prevent harm, or a warning about improper usage. Importantly, a manufacturer remains liable even if it proves it was neither negligent nor fraudulent in making the express warranty.",
        citation: { sourceId: "cpa2019", unitNumber: "84", label: "Consumer Protection Act, Section 84" }
      },
      {
        text: "A product service provider is liable where the service was faulty, imperfect, deficient or inadequate in quality, nature or manner of performance; where an act, omission, negligence or conscious withholding of information caused harm; where adequate instructions or warnings were not issued; or where the service did not conform to an express warranty or the contract terms.",
        citation: { sourceId: "cpa2019", unitNumber: "85", label: "Consumer Protection Act, Section 85" }
      },
      {
        text: "A seller who is not the manufacturer is liable in narrower circumstances — for example where it exercised substantial control over the designing, testing, manufacturing, packaging or labelling of the product; altered or modified it in a way that substantially caused the harm; made its own express warranty which the product failed to meet; sold a product whose manufacturer is unknown or cannot be served or reached; or failed to exercise reasonable care in assembling, inspecting or maintaining the product, or to pass on the manufacturer's warnings.",
        citation: { sourceId: "cpa2019", unitNumber: "86", label: "Consumer Protection Act, Section 86" }
      },
      {
        text: "The Act also writes in exceptions. A seller is not liable where, at the time of harm, the product was misused, altered or modified. A manufacturer is not liable for failing to warn about a danger that is obvious or commonly known to users, and there are specific carve-outs for products supplied to an employer for workplace use, components supplied into another product, and products meant to be dispensed only under expert supervision.",
        citation: { sourceId: "cpa2019", unitNumber: "87", label: "Consumer Protection Act, Section 87" }
      }
    ],
    scopeNote:
      "Whether a specific product was defective, and whether an exception applies, are contested questions of fact decided on evidence. Nothing here decides those questions for a particular case."
  },
  {
    slug: "misleading-advertisements",
    categoryId: "consumer-rights",
    title: "Misleading Advertisements and the Central Authority",
    summary:
      "What the Central Consumer Protection Authority does, its power to recall goods and act against false advertising, and the penalties involved.",
    paragraphs: [
      {
        text: "The Consumer Protection Act creates a regulator as well as a set of tribunals. The Central Consumer Protection Authority is established to regulate matters relating to violations of consumer rights, unfair trade practices and false or misleading advertisements which are prejudicial to the public interest and to consumers as a class.",
        citation: { sourceId: "cpa2019", unitNumber: "10", label: "Consumer Protection Act, Section 10" }
      },
      {
        text: "Its duties are stated as protections owed to consumers as a class: to protect, promote and enforce consumer rights and prevent their violation; to prevent unfair trade practices; to ensure no false or misleading advertisement is made of any goods or services in contravention of the Act; and to ensure no person takes part in publishing such an advertisement.",
        citation: { sourceId: "cpa2019", unitNumber: "18", label: "Consumer Protection Act, Section 18(1)" }
      },
      {
        text: "It has real investigative teeth. It may inquire into violations of consumer rights or unfair trade practices on its own motion, on a complaint, or on a direction from the Central Government; file complaints before any of the three Commissions; and intervene in proceedings before them.",
        citation: { sourceId: "cpa2019", unitNumber: "18", label: "Consumer Protection Act, Section 18(2)" }
      },
      {
        text: "Where investigation shows sufficient evidence of a violation, the Authority may order the recall of goods or withdrawal of services that are dangerous, hazardous or unsafe; the reimbursement of the prices paid by purchasers of the recalled goods or services; and the discontinuation of practices unfair and prejudicial to consumers' interest. It must give the person an opportunity of being heard first.",
        citation: { sourceId: "cpa2019", unitNumber: "20", label: "Consumer Protection Act, Section 20" }
      },
      {
        text: "On advertising, the Authority may direct a trader, manufacturer, endorser, advertiser or publisher to discontinue or modify a false or misleading advertisement. It may impose a penalty on a manufacturer or endorser of up to ten lakh rupees, rising to up to fifty lakh rupees for a subsequent contravention, and may prohibit an endorser from endorsing any product or service for up to one year, or up to three years for a repeat contravention. An endorser is not liable if they exercised due diligence.",
        citation: { sourceId: "cpa2019", unitNumber: "21", label: "Consumer Protection Act, Section 21" }
      },
      {
        text: "There is a criminal provision as well. A manufacturer or service provider who causes a false or misleading advertisement to be made that is prejudicial to consumers' interest is punishable with imprisonment up to two years and a fine up to ten lakh rupees, and for a subsequent offence, imprisonment up to five years and a fine up to fifty lakh rupees.",
        citation: { sourceId: "cpa2019", unitNumber: "89", label: "Consumer Protection Act, Section 89" }
      },
      {
        text: "E-commerce is addressed by rule-making rather than in the Act itself: to prevent unfair trade practices in e-commerce and direct selling, and to protect consumers' interests and rights, the Central Government may take such measures as may be prescribed.",
        citation: { sourceId: "cpa2019", unitNumber: "94", label: "Consumer Protection Act, Section 94" }
      }
    ],
    scopeNote:
      "The e-commerce rules made under section 94 are subordinate legislation and are not part of this project's ingested source library, so their contents are not summarised here."
  }
];
