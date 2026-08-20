import { everydayServicesFaqs } from "./everyday-services";
import { informationAndRecordsFaqs } from "./information-and-records";
import { policeAndArrestFaqs } from "./police-and-arrest";
import { safetyAndRightsFaqs } from "./safety-and-rights";

/**
 * Practical "what should I do?" questions, in the same category order as
 * the learning articles.
 *
 * Every FAQ is grounded in the ingested corpus and cites the provision
 * each substantive claim rests on. Questions were chosen from the demand
 * signal in the project's 313-query citizen-language evaluation set --
 * the sections citizens actually ask about, in their own words -- not
 * from a target count. Where the corpus cannot support a question it was
 * left out rather than written from general knowledge.
 */
export const faqs = [
  ...policeAndArrestFaqs,
  ...safetyAndRightsFaqs,
  ...everydayServicesFaqs,
  ...informationAndRecordsFaqs
];
