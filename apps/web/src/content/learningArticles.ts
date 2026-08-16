/**
 * Module 1A structured learning content.
 *
 * These are NOT live LLM output. Each paragraph is written against the
 * exact ingested statutory text (see services/ai/data/legal-corpus/)
 * and tagged with the section it's grounded in, so the UI can render
 * "Source: BNSS, Section 43" next to every claim rather than a single
 * blanket citation at the bottom. The live conversational "ask a
 * doubt" box is a separate, later increment (Module 1B) that adds
 * retrieval + LLM generation + abstention on top of this same corpus.
 */

export type Citation = {
  sourceId: "constitution" | "bns" | "bnss" | "bsa";
  unitNumber: string;
  label: string; // e.g. "BNSS, Section 43"
};

export type ArticleParagraph = {
  text: string;
  citation?: Citation;
};

export type LearningArticle = {
  slug: string;
  title: string;
  summary: string;
  paragraphs: ArticleParagraph[];
};

export const learningArticles: LearningArticle[] = [
  {
    slug: "cognizable-vs-non-cognizable",
    title: "Cognizable vs Non-Cognizable Offences",
    summary:
      "Whether police can arrest you without a warrant depends on which category the offence falls into.",
    paragraphs: [
      {
        text: "Indian criminal law sorts offences into two categories, and the difference changes what police can do the moment a complaint is made. A cognizable offence is one where a police officer may arrest without a warrant and start investigating without needing a magistrate's permission first. These are generally the more serious offences \u2014 things like assault causing serious injury, robbery, or offences carrying longer prison terms.",
        citation: { sourceId: "bnss", unitNumber: "2", label: "BNSS, Section 2(1)(g)" },
      },
      {
        text: "A non-cognizable offence is the opposite: police have no authority to arrest without a warrant, and they cannot investigate on their own initiative \u2014 they need a magistrate's order first. These tend to be less serious matters, such as minor scuffles or simple defamation.",
        citation: { sourceId: "bnss", unitNumber: "2", label: "BNSS, Section 2(1)(o)" },
      },
      {
        text: "In practice, this is the difference between a police station registering an FIR and starting an investigation immediately (cognizable) versus recording an NCR and telling you to approach a magistrate for permission to proceed (non-cognizable). Whether a specific offence is cognizable or non-cognizable is fixed by the First Schedule to the BNSS, not by how serious the officer personally thinks it is.",
        citation: { sourceId: "bnss", unitNumber: "2", label: "BNSS, Section 2(1)(g)" },
      },
    ],
  },
  {
    slug: "bailable-vs-non-bailable",
    title: "Bailable vs Non-Bailable Offences",
    summary: "Some offences give you a right to bail. Others leave it to a court's discretion.",
    paragraphs: [
      {
        text: "\u201cBail\u201d means the release of an arrested or accused person from custody, on conditions set by a police officer or a court, after they execute a bond or a bail bond. It is not a favour \u2014 for a bailable offence, it is a right.",
        citation: { sourceId: "bnss", unitNumber: "2", label: "BNSS, Section 2(1)(b)" },
      },
      {
        text: "A bailable offence is one the First Schedule to the BNSS marks as bailable (or that some other law makes bailable). For these, if you're arrested, the police officer or court is legally required to release you on bail if you're prepared to give it \u2014 it isn't discretionary. A non-bailable offence is everything else: bail is at the court's discretion, and for serious non-bailable offences it can be refused.",
        citation: { sourceId: "bnss", unitNumber: "2", label: "BNSS, Section 2(1)(c)" },
      },
      {
        text: "A \u201cbail bond\u201d is an undertaking to appear in court that's backed by a surety (someone else vouching for you); a \u201cbond\u201d is the same kind of undertaking given without a surety. Which one applies depends on the terms the officer or court sets.",
        citation: { sourceId: "bnss", unitNumber: "2", label: "BNSS, Section 2(1)(d)-(e)" },
      },
      {
        text: "This module does not yet cover the bail application procedure itself (sections 478\u2013496 of the BNSS) \u2014 that's still being added to the source library. If you need to actually apply for bail, that's exactly the kind of situation where you should talk to a lawyer rather than rely on a summary.",
      },
    ],
  },
  {
    slug: "what-happens-when-arrested",
    title: "What Happens When You're Arrested",
    summary: "The rights you have during an arrest, and what a police officer is legally required to do.",
    paragraphs: [
      {
        text: "An arrest is a formal act \u2014 the officer must actually touch or confine you, unless you submit to custody by word or action. For women, submission to an oral statement of arrest is presumed, and unless the circumstances require otherwise, only a female police officer may touch a woman to arrest her.",
        citation: { sourceId: "bnss", unitNumber: "43", label: "BNSS, Section 43(1)" },
      },
      {
        text: "Handcuffs may only be used with regard to the nature and gravity of the offence \u2014 for example against a habitual or repeat offender, someone who escaped custody, or someone accused of organised crime, terrorism, serious drug offences, murder, rape, or similar serious offences. It isn't a routine default for every arrest.",
        citation: { sourceId: "bnss", unitNumber: "43", label: "BNSS, Section 43(3)" },
      },
      {
        text: "Except in exceptional circumstances, a woman cannot be arrested after sunset and before sunrise. If those circumstances genuinely exist, the arresting woman police officer must first get written permission from a magistrate.",
        citation: { sourceId: "bnss", unitNumber: "43", label: "BNSS, Section 43(5)" },
      },
      {
        text: "You have the right to know why you're being arrested \u2014 the officer must tell you the full particulars of the offence, or the grounds for the arrest, immediately. If the offence isn't a non-bailable one, they must also tell you that you're entitled to bail and can arrange sureties.",
        citation: { sourceId: "bnss", unitNumber: "47", label: "BNSS, Section 47" },
      },
      {
        text: "You have the right to have someone told. The police must promptly inform a relative, friend, or another person you name about your arrest and where you're being held, and a designated police officer in the district is also notified. This has to happen as soon as you reach the police station.",
        citation: { sourceId: "bnss", unitNumber: "48", label: "BNSS, Section 48" },
      },
      {
        text: "You have the right to meet an advocate of your choice during interrogation \u2014 though not to have them present throughout the entire interrogation.",
        citation: { sourceId: "bnss", unitNumber: "38", label: "BNSS, Section 38" },
      },
      {
        text: "There's a hard limit on how long you can be held before being brought before a magistrate: no more than 24 hours from arrest, not counting travel time to the magistrate's court, unless a magistrate specifically orders otherwise.",
        citation: { sourceId: "bnss", unitNumber: "58", label: "BNSS, Section 58" },
      },
      {
        text: "You cannot be discharged from arrest except on a bond, a bail bond, or a magistrate's specific order \u2014 an officer can't simply let you go informally once you're in custody.",
        citation: { sourceId: "bnss", unitNumber: "60", label: "BNSS, Section 60" },
      },
      {
        text: "This covers the arrest procedure itself. It does not cover how to actually apply for bail, or what to do at a hearing \u2014 those need a lawyer, not a summary. If you or someone you know is being arrested right now, the immediate priority is knowing these rights exist, not trying to argue law with the officer on the spot.",
      },
    ],
  },
];
