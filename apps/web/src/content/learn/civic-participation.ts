import type { LearningArticle } from "./types";

export const civicParticipationArticles: LearningArticle[] = [
  {
    slug: "civic-complaints",
    categoryId: "civic-participation",
    title: "Civic Complaints",
    summary:
      "How a civic report works on this platform: what it is for, what happens after you submit one, and how the deadline is set.",
    paragraphs: [
      {
        text: "A civic complaint is a report about a local public problem — a pothole, uncollected garbage, a dead street light, a water supply failure, road damage, drainage or sewage, or traffic and signage. On this platform it is filed as a civic report, with a category, a title, a description, the location, and an optional landmark and photo."
      },
      {
        text: "A civic report is tied to your account, because a report has an owner: you need to be signed in to file one, and you can follow your own reports afterwards. What the authority sees is the report, its location and its history — not a free-form claim about who you are."
      },
      {
        text: "Once submitted, a report moves through a fixed set of states: submitted, under review, in progress, and then resolved or rejected. Every change is recorded in the report's history with who made it and when, so the trail of what happened is visible rather than assumed."
      },
      {
        text: "Priority is assigned by authority staff rather than guessed by the system, and the response deadline follows from that priority. The deadline is measured from when you submitted the report, not from when staff got round to it, so the clock does not restart when the record is touched."
      },
      {
        text: "The response windows used here are simulation values chosen for a student project. They are not a service-level commitment by any real authority, and nothing on this platform substitutes for your municipal body's own complaint channel."
      },
      {
        text: "A civic complaint is about a service failure. If what happened to you is a criminal offence rather than a civic problem, the route is a police station: information about a cognizable offence may be given to an officer in charge orally or by electronic communication, irrespective of the area where the offence was committed. If there is an immediate threat to life or safety, call 112.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(1)" }
      }
    ],
    scopeNote:
      "This article describes how civic reporting works on this platform. It is not a statement of any municipal law or of any authority's statutory duty to respond."
  },
  {
    slug: "petitions-explained",
    categoryId: "civic-participation",
    title: "Petitions",
    summary:
      "What a petition is on this platform, how signatures work, and what an authority response means.",
    paragraphs: [
      {
        text: "A petition is a public request for action on a shared issue — roads and infrastructure, sanitation, water, transport, environment, public safety, health, education, or local governance. Unlike a civic report, which is one person's account of one problem, a petition is written to be signed by others."
      },
      {
        text: "Petitions rest on ordinary constitutional freedoms: the right to freedom of speech and expression, and the right to assemble peaceably and without arms, both of which are guaranteed to citizens subject to the reasonable restrictions the Constitution itself allows.",
        citation: { sourceId: "constitution", unitNumber: "19", label: "Constitution, Article 19(1)(a)-(b)" }
      },
      {
        text: "On this platform a petition is public content: reading one needs no account. Publishing a petition, signing one, and moderating one all do require an account, and a citizen may sign a given petition only once."
      },
      {
        text: "The creator sets a signature goal when publishing. That goal grants no privilege — it is the creator's own target, and reaching it is a triage signal for staff rather than an automatic trigger."
      },
      {
        text: "A petition is open for signatures, then may go under review, and ends either answered, closed, or removed. Answered is the outcome the feature exists to produce: it means an authority published a formal response, which stays attached to the petition for anyone to read."
      },
      {
        text: "A removed petition stops being public content but does not vanish. It stays visible to its creator, so they can read why it was removed, and to staff, so the decision remains auditable."
      }
    ]
  },
  {
    slug: "complaint-vs-petition-vs-legal-case",
    categoryId: "civic-participation",
    title: "Complaint vs Petition vs Legal Case",
    summary:
      "Three different things people call “filing a complaint”, and which one fits which problem.",
    paragraphs: [
      {
        text: "The word “complaint” carries at least three meanings, and choosing the wrong one costs time. A civic complaint asks an authority to fix a public service problem. A petition asks for a change and gathers public support for it. A legal case asks a court, a commission or the police to apply the law to specific facts."
      },
      {
        text: "In criminal law the word has a precise meaning. A complaint is any allegation made orally or in writing to a Magistrate, with a view to the Magistrate taking action under the BNSS, that some person — known or unknown — has committed an offence. It expressly does not include a police report.",
        citation: { sourceId: "bnss", unitNumber: "2", label: "BNSS, Section 2(1)(h)" }
      },
      {
        text: "That is different again from reporting a cognizable offence at a police station, which is recorded as first information under section 173 and lets the police investigate without a magistrate's order. Reporting a non-cognizable offence goes down the section 174 route instead, where the informant is referred to the Magistrate.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Sections 173 and 174" }
      },
      {
        text: "In consumer matters, a complaint is yet another thing: a filing with a District Commission about goods sold or delivered, or a service provided, by the consumer, a recognised consumer association, several consumers with the same interest, or a government authority — subject to a two-year limitation period from the cause of action.",
        citation: { sourceId: "cpa2019", unitNumber: "35", label: "Consumer Protection Act, Sections 35 and 69" }
      },
      {
        text: "A practical way to choose: if a public service is failing, use a civic report. If you want a decision changed and need numbers behind it, use a petition. If someone has committed an offence against you, go to the police. If a product or service you paid for was defective or deficient, the consumer route applies. And if you are unsure, or the matter is serious, talk to a lawyer — or a legal services authority if you qualify for free legal aid.",
        citation: { sourceId: "lsa", unitNumber: "12", label: "Legal Services Authorities Act, Section 12" }
      },
      {
        text: "These routes are not mutually exclusive. The Consumer Protection Act says in terms that its provisions are in addition to, and not in derogation of, any other law in force.",
        citation: { sourceId: "cpa2019", unitNumber: "100", label: "Consumer Protection Act, Section 100" }
      }
    ]
  },
  {
    slug: "participating-effectively",
    categoryId: "civic-participation",
    title: "How Citizens Can Participate Effectively",
    summary:
      "Practical habits that make a report or petition easier to act on, and the duties the Constitution attaches to citizenship.",
    paragraphs: [
      {
        text: "Be specific about the facts. A report that names a category, a precise location and a landmark, and describes what is wrong in plain terms, can be routed and verified. A report that describes a feeling cannot."
      },
      {
        text: "Keep your own copies. Where the law gives you a document, take it: a copy of first information recorded by a police station must be given to the informant or victim forthwith and free of cost, and a dated copy of anything you send in writing is what later establishes what you reported and when.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(2)" }
      },
      {
        text: "Use the escalation the statute provides rather than repeating the same step. If a police station refuses to record information about a cognizable offence, the BNSS route is to send the substance of that information in writing and by post to the Superintendent of Police; if a civic report stalls, the platform's history trail is the record of what has and has not happened.",
        citation: { sourceId: "bnss", unitNumber: "173", label: "BNSS, Section 173(4)" }
      },
      {
        text: "For a petition, ask for one clear thing. A petition with a defined ask and a realistic signature goal gives an authority something it can actually answer; an open-ended grievance gives it nothing to respond to."
      },
      {
        text: "Participation is not only a right. The Constitution lists duties of every citizen, including safeguarding public property and abjuring violence, protecting and improving the natural environment, promoting harmony and the spirit of common brotherhood, and developing the scientific temper and the spirit of inquiry and reform.",
        citation: { sourceId: "constitution", unitNumber: "51A", label: "Constitution, Article 51A" }
      },
      {
        text: "Finally, know when a civic route is the wrong route. This platform is for public awareness and for civic participation. A situation you are actually in — an arrest, a threat, a case in court — needs a legal adviser, and an emergency needs 112."
      }
    ]
  }
];
