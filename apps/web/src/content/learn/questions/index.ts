import { arrestBailQuestions } from "./arrest-bail";
import { childrenQuestions } from "./children-and-young-people";
import { civicParticipationQuestions } from "./civic-participation";
import { constitutionQuestions } from "./constitution";
import { consumerRightsQuestions } from "./consumer-rights";
import { courtsAndEvidenceQuestions } from "./courts-and-evidence";
import { digitalRightsQuestions } from "./digital-rights";
import { everydayRightsQuestions } from "./everyday-rights";
import { legalAidQuestions } from "./legal-aid";
import { policeFirQuestions } from "./police-fir";
import { womenAndSafetyQuestions } from "./women-and-safety";

/**
 * Every quiz question in the Learn module, in the same category order as
 * `learningArticles`. Each question names the article it is drawn from,
 * and its explanation is grounded in the same provision that article
 * cites — the quiz never teaches anything the articles do not.
 */
export const quizQuestions = [
  ...constitutionQuestions,
  ...policeFirQuestions,
  ...arrestBailQuestions,
  ...courtsAndEvidenceQuestions,
  ...everydayRightsQuestions,
  ...consumerRightsQuestions,
  ...digitalRightsQuestions,
  ...womenAndSafetyQuestions,
  ...childrenQuestions,
  ...legalAidQuestions,
  ...civicParticipationQuestions
];
