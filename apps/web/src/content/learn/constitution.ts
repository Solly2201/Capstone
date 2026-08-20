import type { LearningArticle } from "./types";

export const constitutionArticles: LearningArticle[] = [
  {
    slug: "what-are-fundamental-rights",
    categoryId: "constitution",
    title: "What Are Fundamental Rights?",
    summary:
      "Part III of the Constitution places limits on what the State may do to you, and makes any law that crosses those limits void.",
    paragraphs: [
      {
        text: "Fundamental Rights are the guarantees written into Part III of the Constitution of India. They differ from ordinary legal protections in one important way: they bind the State itself. In Part III, “the State” is defined broadly — it covers the Government and Parliament of India, the Government and Legislature of each State, and all local or other authorities within the territory of India or under the control of the Government of India.",
        citation: { sourceId: "constitution", unitNumber: "12", label: "Constitution, Article 12" }
      },
      {
        text: "Because these rights bind the State, they also override contrary law. Any law in force before the Constitution began is void to the extent that it is inconsistent with Part III, and the State cannot make a new law that takes away or abridges these rights — such a law is void to the extent of the contravention. “Law” here is wide: it includes an Ordinance, order, bye-law, rule, regulation, notification, custom or usage having the force of law.",
        citation: { sourceId: "constitution", unitNumber: "13", label: "Constitution, Article 13" }
      },
      {
        text: "The rights in Part III are usually grouped by theme: equality (Articles 14 to 18), freedom (Articles 19 to 22), protection against exploitation (Articles 23 and 24), freedom of religion (Articles 25 to 28), cultural and educational rights (Articles 29 and 30), and the right to constitutional remedies (Article 32). Each group is covered separately in this section."
      },
      {
        text: "A right without a way to enforce it would not be worth much, so the Constitution guarantees the right to move the Supreme Court directly for the enforcement of Part III rights, and that guarantee is itself a fundamental right. This is what makes Part III enforceable rather than aspirational.",
        citation: { sourceId: "constitution", unitNumber: "32", label: "Constitution, Article 32" }
      },
      {
        text: "Some acts declared to be offences under Part III need a separate law to prescribe punishment for them. The Constitution reserves that power to Parliament and directs Parliament to make such laws — so a Part III protection is often backed by a penal statute rather than by Part III alone.",
        citation: { sourceId: "constitution", unitNumber: "35", label: "Constitution, Article 35" }
      }
    ]
  },
  {
    slug: "right-to-equality",
    categoryId: "constitution",
    title: "Right to Equality",
    summary:
      "Articles 14 to 18: equal treatment before the law, no discrimination on listed grounds, equal opportunity in public employment, and the abolition of untouchability.",
    paragraphs: [
      {
        text: "The base rule is short. The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India. Note the word “person” — this one is not limited to citizens.",
        citation: { sourceId: "constitution", unitNumber: "14", label: "Constitution, Article 14" }
      },
      {
        text: "The State may not discriminate against any citizen on grounds only of religion, race, caste, sex, place of birth, or any of them. The same grounds also protect access to everyday public places: no citizen may be subjected to any disability, liability, restriction or condition on those grounds with regard to access to shops, public restaurants, hotels and places of public entertainment, or the use of wells, tanks, bathing ghats, roads and places of public resort maintained wholly or partly out of State funds or dedicated to the use of the general public.",
        citation: { sourceId: "constitution", unitNumber: "15", label: "Constitution, Article 15(1)-(2)" }
      },
      {
        text: "Equality here does not forbid every distinction. The Constitution expressly permits the State to make special provision for women and children, and for the advancement of socially and educationally backward classes of citizens and the Scheduled Castes and Scheduled Tribes, including for admission to educational institutions.",
        citation: { sourceId: "constitution", unitNumber: "15", label: "Constitution, Article 15(3)-(5)" }
      },
      {
        text: "In public employment there is equality of opportunity for all citizens in matters relating to employment or appointment to any office under the State, and no citizen may be ineligible for or discriminated against in respect of such employment on grounds only of religion, race, caste, sex, descent, place of birth or residence. Reservation of appointments or posts in favour of a backward class that is not adequately represented in the services under the State is expressly permitted.",
        citation: { sourceId: "constitution", unitNumber: "16", label: "Constitution, Article 16" }
      },
      {
        text: "Untouchability is abolished and its practice in any form is forbidden. Enforcing any disability arising out of untouchability is an offence punishable in accordance with law.",
        // Article 17's text sits inside the corpus chunk for Article 16 --
        // the source PDF's two-column layout runs them together -- so the
        // citation points at the chunk that actually holds the text.
        citation: { sourceId: "constitution", unitNumber: "16", label: "Constitution, Article 17" }
      },
      {
        text: "Finally, titles are abolished: the State confers no title other than a military or academic distinction, and no citizen of India may accept a title from any foreign State.",
        citation: { sourceId: "constitution", unitNumber: "18", label: "Constitution, Article 18" }
      }
    ]
  },
  {
    slug: "right-to-freedom",
    categoryId: "constitution",
    title: "Right to Freedom",
    summary:
      "Articles 19 to 22: the freedoms and their reasonable restrictions, protection in criminal prosecutions, life and personal liberty, and safeguards on arrest.",
    paragraphs: [
      {
        text: "All citizens have the right to freedom of speech and expression; to assemble peaceably and without arms; to form associations or unions; to move freely throughout the territory of India; to reside and settle in any part of the territory of India; and to practise any profession, or to carry on any occupation, trade or business.",
        citation: { sourceId: "constitution", unitNumber: "19", label: "Constitution, Article 19(1)" }
      },
      {
        text: "None of these freedoms is unlimited. The Constitution itself allows the State to impose reasonable restrictions — on free speech, for example, in the interests of the sovereignty and integrity of India, the security of the State, friendly relations with foreign States, public order, decency or morality, or in relation to contempt of court, defamation or incitement to an offence. Each of the other freedoms has its own list of permitted restrictions in the clauses that follow.",
        citation: { sourceId: "constitution", unitNumber: "19", label: "Constitution, Article 19(2)-(6)" }
      },
      {
        text: "In criminal matters, three protections apply together. You cannot be convicted of an offence except for violating a law that was in force when the act was committed, and you cannot be given a penalty greater than the one that law allowed at the time. You cannot be prosecuted and punished for the same offence more than once. And no person accused of an offence can be compelled to be a witness against themselves.",
        citation: { sourceId: "constitution", unitNumber: "20", label: "Constitution, Article 20" }
      },
      {
        text: "No person shall be deprived of his life or personal liberty except according to procedure established by law. This is the provision that makes lawful procedure — not official convenience — the condition for detaining anyone.",
        citation: { sourceId: "constitution", unitNumber: "21", label: "Constitution, Article 21" }
      },
      {
        text: "On arrest, the Constitution guarantees that no arrested person shall be detained in custody without being informed, as soon as may be, of the grounds for the arrest, nor be denied the right to consult and to be defended by a legal practitioner of their choice. Every arrested and detained person must be produced before the nearest magistrate within twenty-four hours of arrest, excluding the time necessary for the journey to the court, and may not be detained beyond that period without a magistrate's authority.",
        citation: { sourceId: "constitution", unitNumber: "22", label: "Constitution, Article 22(1)-(2)" }
      },
      {
        text: "Those two safeguards do not apply to an enemy alien, or to a person arrested or detained under a preventive detention law — preventive detention is dealt with by the separate clauses of the same Article.",
        citation: { sourceId: "constitution", unitNumber: "22", label: "Constitution, Article 22(3)" }
      }
    ]
  },
  {
    slug: "right-against-exploitation",
    categoryId: "constitution",
    title: "Right against Exploitation",
    summary:
      "Articles 23 and 24: trafficking and forced labour are prohibited, and children under fourteen may not be employed in hazardous work.",
    paragraphs: [
      {
        text: "Traffic in human beings, begar, and other similar forms of forced labour are prohibited, and any contravention of this prohibition is an offence punishable in accordance with law.",
        citation: { sourceId: "constitution", unitNumber: "23", label: "Constitution, Article 23(1)" }
      },
      {
        text: "There is one carve-out. The State may impose compulsory service for public purposes, but in doing so it may not discriminate on grounds only of religion, race, caste or class, or any of them.",
        citation: { sourceId: "constitution", unitNumber: "23", label: "Constitution, Article 23(2)" }
      },
      {
        text: "No child below the age of fourteen years may be employed to work in any factory or mine, or engaged in any other hazardous employment.",
        citation: { sourceId: "constitution", unitNumber: "24", label: "Constitution, Article 24" }
      },
      {
        text: "These Articles connect to other parts of the system. Being a victim of trafficking in human beings or begar as referred to in Article 23 is one of the criteria that entitles a person to free legal services under the Legal Services Authorities Act, covered separately in the everyday rights section.",
        citation: { sourceId: "lsa", unitNumber: "12", label: "Legal Services Authorities Act, Section 12(b)" }
      }
    ]
  },
  {
    slug: "freedom-of-religion",
    categoryId: "constitution",
    title: "Freedom of Religion",
    summary:
      "Articles 25 to 28: freedom of conscience and practice, the rights of religious denominations, and limits on religious taxation and instruction.",
    paragraphs: [
      {
        text: "Subject to public order, morality and health and to the other provisions of Part III, all persons are equally entitled to freedom of conscience and the right freely to profess, practise and propagate religion. The Constitution expressly notes that wearing and carrying kirpans is deemed to be included in the profession of the Sikh religion.",
        citation: { sourceId: "constitution", unitNumber: "25", label: "Constitution, Article 25(1)" }
      },
      {
        text: "This does not displace the State's power to regulate any economic, financial, political or other secular activity associated with religious practice, or to make laws providing for social welfare and reform or throwing open Hindu religious institutions of a public character to all classes and sections of Hindus.",
        citation: { sourceId: "constitution", unitNumber: "25", label: "Constitution, Article 25(2)" }
      },
      {
        text: "Subject to the same conditions of public order, morality and health, every religious denomination or any section of one has the right to establish and maintain institutions for religious and charitable purposes, to manage its own affairs in matters of religion, to own and acquire movable and immovable property, and to administer that property in accordance with law.",
        citation: { sourceId: "constitution", unitNumber: "26", label: "Constitution, Article 26" }
      },
      {
        text: "No person may be compelled to pay any tax whose proceeds are specifically appropriated to pay for the promotion or maintenance of any particular religion or religious denomination.",
        citation: { sourceId: "constitution", unitNumber: "27", label: "Constitution, Article 27" }
      },
      {
        text: "In education, no religious instruction may be provided in an institution wholly maintained out of State funds. In an institution recognised by the State or receiving State aid, no person may be required to take part in religious instruction or attend religious worship without their consent — or, if they are a minor, their guardian's consent.",
        citation: { sourceId: "constitution", unitNumber: "28", label: "Constitution, Article 28" }
      }
    ]
  },
  {
    slug: "cultural-and-educational-rights",
    categoryId: "constitution",
    title: "Cultural and Educational Rights",
    summary:
      "Articles 29 and 30: the right to conserve a distinct language, script or culture, and the right of minorities to run their own educational institutions.",
    paragraphs: [
      {
        text: "Any section of citizens residing in India, or in any part of it, that has a distinct language, script or culture of its own has the right to conserve it.",
        citation: { sourceId: "constitution", unitNumber: "29", label: "Constitution, Article 29(1)" }
      },
      {
        text: "No citizen may be denied admission into an educational institution maintained by the State, or receiving aid out of State funds, on grounds only of religion, race, caste or language.",
        citation: { sourceId: "constitution", unitNumber: "29", label: "Constitution, Article 29(2)" }
      },
      {
        text: "All minorities, whether based on religion or language, have the right to establish and administer educational institutions of their choice.",
        citation: { sourceId: "constitution", unitNumber: "30", label: "Constitution, Article 30(1)" }
      },
      {
        text: "That right is protected on the money side too: in granting aid to educational institutions, the State may not discriminate against an institution on the ground that it is managed by a minority, whether religious or linguistic.",
        citation: { sourceId: "constitution", unitNumber: "30", label: "Constitution, Article 30(2)" }
      }
    ]
  },
  {
    slug: "constitutional-remedies",
    categoryId: "constitution",
    title: "Right to Constitutional Remedies",
    summary:
      "Article 32: the right to go directly to the Supreme Court to enforce a fundamental right, and the writs it can issue.",
    paragraphs: [
      {
        text: "The right to move the Supreme Court by appropriate proceedings for the enforcement of the rights conferred by Part III is itself guaranteed. In other words, the remedy is a fundamental right, not a procedural favour.",
        citation: { sourceId: "constitution", unitNumber: "32", label: "Constitution, Article 32(1)" }
      },
      {
        text: "To enforce those rights the Supreme Court has power to issue directions, orders or writs — including writs in the nature of habeas corpus, mandamus, prohibition, quo warranto and certiorari — whichever is appropriate.",
        citation: { sourceId: "constitution", unitNumber: "32", label: "Constitution, Article 32(2)" }
      },
      {
        text: "Parliament may by law empower another court to exercise, within its own local limits, all or any of those powers. And the right guaranteed by Article 32 cannot be suspended except as the Constitution itself provides.",
        citation: { sourceId: "constitution", unitNumber: "32", label: "Constitution, Article 32(3)-(4)" }
      },
      {
        text: "Article 32 is the enforcement route for Part III rights specifically. Which court to approach, what to plead, and whether a case is worth bringing at all are decisions that need a lawyer — this article explains that the door exists, not how to walk through it."
      }
    ],
    scopeNote:
      "Covers the constitutional text of Article 32 only. High Court writ jurisdiction, filing procedure, limitation and when a writ petition is the right remedy are not covered — they depend on facts and on case law that is not part of this project's source library."
  },
  {
    slug: "fundamental-duties",
    categoryId: "constitution",
    title: "Fundamental Duties",
    summary:
      "Article 51A: the duties the Constitution places on every citizen, alongside the rights it guarantees.",
    paragraphs: [
      {
        text: "Alongside Part III rights, the Constitution lists duties of every citizen of India. These begin with abiding by the Constitution and respecting its ideals and institutions, the National Flag and the National Anthem; cherishing the noble ideals that inspired the national struggle for freedom; and upholding and protecting the sovereignty, unity and integrity of India.",
        citation: { sourceId: "constitution", unitNumber: "51A", label: "Constitution, Article 51A(a)-(c)" }
      },
      {
        text: "The list continues with defending the country and rendering national service when called upon; promoting harmony and the spirit of common brotherhood amongst all the people of India transcending religious, linguistic and regional or sectional diversities; and renouncing practices derogatory to the dignity of women.",
        citation: { sourceId: "constitution", unitNumber: "51A", label: "Constitution, Article 51A(d)-(e)" }
      },
      {
        text: "It also includes valuing and preserving the rich heritage of our composite culture; protecting and improving the natural environment including forests, lakes, rivers and wild life, and having compassion for living creatures; developing the scientific temper, humanism and the spirit of inquiry and reform; safeguarding public property and abjuring violence; and striving towards excellence in all spheres of individual and collective activity.",
        citation: { sourceId: "constitution", unitNumber: "51A", label: "Constitution, Article 51A(f)-(j)" }
      },
      {
        text: "A further duty applies to a parent or guardian: to provide opportunities for education to their child or ward between the ages of six and fourteen years.",
        citation: { sourceId: "constitution", unitNumber: "51A", label: "Constitution, Article 51A(k)" }
      }
    ]
  },
  {
    slug: "directive-principles",
    categoryId: "constitution",
    title: "Directive Principles of State Policy",
    summary:
      "Part IV sets goals for the State that no court will enforce, but which are 'fundamental in the governance of the country' — including free legal aid.",
    paragraphs: [
      {
        text: "Part IV works differently from Part III, and the Constitution says so plainly. Its provisions are not enforceable by any court — but the principles laid down in it are nevertheless fundamental in the governance of the country, and it is the duty of the State to apply them in making laws. So a Directive Principle is not something you can sue on; it is something the State is told to build towards.",
        citation: { sourceId: "constitution", unitNumber: "37", label: "Constitution, Article 37" }
      },
      {
        text: "The opening goal is a social order. The State shall strive to promote the welfare of the people by securing and protecting as effectively as it may a social order in which justice — social, economic and political — informs all the institutions of national life, and shall in particular strive to minimise inequalities in income and endeavour to eliminate inequalities in status, facilities and opportunities.",
        citation: { sourceId: "constitution", unitNumber: "37", label: "Constitution, Article 38" }
      },
      {
        text: "Article 39 lists specific policy directions: that citizens, men and women equally, have the right to an adequate means of livelihood; that ownership and control of the community's material resources are distributed to best subserve the common good; that the economic system does not concentrate wealth and the means of production to the common detriment; that there is equal pay for equal work for both men and women; and that the health and strength of workers and the tender age of children are not abused.",
        citation: { sourceId: "constitution", unitNumber: "39", label: "Constitution, Article 39" }
      },
      {
        text: "One Directive Principle is the constitutional root of the legal-aid system described elsewhere in this library: the State shall secure that the operation of the legal system promotes justice on a basis of equal opportunity, and shall in particular provide free legal aid, so that opportunities for securing justice are not denied to any citizen by reason of economic or other disabilities.",
        citation: { sourceId: "constitution", unitNumber: "39", label: "Constitution, Article 39A" }
      },
      {
        text: "Other principles cover work and welfare: within the limits of its economic capacity and development, the State is to make effective provision for securing the right to work, to education, and to public assistance in cases of unemployment, old age, sickness and disablement, and in other cases of undeserved want.",
        citation: { sourceId: "constitution", unitNumber: "41", label: "Constitution, Article 41" }
      },
      {
        text: "Part IV also directs the State to promote with special care the educational and economic interests of the weaker sections, and particularly of the Scheduled Castes and Scheduled Tribes, and to protect them from social injustice and all forms of exploitation; to raise the level of nutrition, the standard of living and public health; and to take steps to separate the judiciary from the executive in the public services of the State.",
        citation: { sourceId: "constitution", unitNumber: "46", label: "Constitution, Articles 46, 47 and 50" }
      }
    ],
    scopeNote:
      "Because Part IV is expressly not enforceable by a court, a Directive Principle on its own is not a basis for a claim. Its practical effect comes through the laws Parliament and State Legislatures make in pursuit of it — the Legal Services Authorities Act being the clearest example in this library."
  },
  {
    slug: "writ-remedies",
    categoryId: "constitution",
    title: "Writ Remedies: Going to Court for a Right",
    summary:
      "The five writs named in the Constitution, the difference between approaching the Supreme Court and a High Court, and why one of these is itself a fundamental right.",
    paragraphs: [
      {
        text: "The right to move the Supreme Court by appropriate proceedings for the enforcement of Part III rights is itself guaranteed as a fundamental right. That is what makes Part III enforceable rather than aspirational — the remedy is written into the same Part as the rights.",
        citation: { sourceId: "constitution", unitNumber: "32", label: "Constitution, Article 32(1)" }
      },
      {
        text: "The Constitution names the instruments by name. The Supreme Court has power to issue directions, orders or writs — including writs in the nature of habeas corpus, mandamus, prohibition, quo warranto and certiorari, whichever may be appropriate — for the enforcement of any of the rights conferred by Part III.",
        citation: { sourceId: "constitution", unitNumber: "32", label: "Constitution, Article 32(2)" }
      },
      {
        text: "This guarantee is protected against ordinary suspension. The right guaranteed by Article 32 shall not be suspended except as otherwise provided for by the Constitution itself.",
        citation: { sourceId: "constitution", unitNumber: "32", label: "Constitution, Article 32(4)" }
      },
      {
        text: "High Courts have a wider writ jurisdiction than the Supreme Court's Article 32 power, not a narrower one. A High Court may issue directions, orders or writs — including the same five — for the enforcement of any Part III right and for any other purpose. That last phrase is the difference: Article 32 is confined to fundamental rights, while a High Court's writ power reaches beyond them.",
        citation: { sourceId: "constitution", unitNumber: "225", label: "Constitution, Article 226(1)" }
      },
      {
        text: "Geography is handled generously. A High Court may exercise the power to issue writs to any Government, authority or person where the cause of action arises wholly or in part within its territories — even if the seat of that Government or authority, or the residence of that person, is not within them.",
        citation: { sourceId: "constitution", unitNumber: "225", label: "Constitution, Article 226(2)" }
      },
      {
        text: "Parliament can extend the writ power further. Without prejudice to the Supreme Court's powers under Article 32, Parliament may by law empower any other court to exercise, within the local limits of its jurisdiction, all or any of those powers; and Parliament may confer on the Supreme Court the power to issue such writs for purposes other than the enforcement of Part III rights.",
        citation: { sourceId: "constitution", unitNumber: "139", label: "Constitution, Articles 32(3) and 139" }
      }
    ],
    scopeNote:
      "Which writ fits a situation, and whether a High Court or the Supreme Court is the right forum, are questions of legal strategy decided on the facts. The names and the constitutional basis are general information; the choice is not."
  }
];
