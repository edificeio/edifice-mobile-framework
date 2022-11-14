import { QuestionType } from '~/modules/form/reducer';

import { FormDateCard } from './FormDateCard';
import { FormFileCard } from './FormFileCard';
import { FormFreeTextCard } from './FormFreeTextCard';
import { FormLongAnswerCard } from './FormLongAnswerCard';
import { FormMultipleAnswerCard } from './FormMultipleAnswerCard';
import { FormShortAnswerCard } from './FormShortAnswerCard';
import { FormSingleAnswerCard } from './FormSingleAnswerCard';
import { FormSingleAnswerRadioCard } from './FormSingleAnswerRadioCard';
import { FormSliderCard } from './FormSliderCard';
import { FormTimeCard } from './FormTimeCard';

export const getQuestionCard = (questionType: QuestionType) => {
  switch (questionType) {
    case QuestionType.FREETEXT:
      return FormFreeTextCard;
    case QuestionType.SHORTANSWER:
      return FormShortAnswerCard;
    case QuestionType.LONGANSWER:
      return FormLongAnswerCard;
    case QuestionType.SINGLEANSWER:
      return FormSingleAnswerCard;
    case QuestionType.MULTIPLEANSWER:
      return FormMultipleAnswerCard;
    case QuestionType.DATE:
      return FormDateCard;
    case QuestionType.TIME:
      return FormTimeCard;
    case QuestionType.FILE:
      return FormFileCard;
    case QuestionType.SINGLEANSWERRADIO:
      return FormSingleAnswerRadioCard;
    case QuestionType.SLIDER:
      return FormSliderCard;
    default:
      return FormFreeTextCard;
  }
};
