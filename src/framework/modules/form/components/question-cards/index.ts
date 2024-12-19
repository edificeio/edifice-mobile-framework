import { FormDateCard } from './FormDateCard';
import { FormFileCard } from './FormFileCard';
import { FormFreeTextCard } from './FormFreeTextCard';
import { FormLongAnswerCard } from './FormLongAnswerCard';
import { FormMatrixCard } from './FormMatrixCard';
import { FormMultipleAnswerCard } from './FormMultipleAnswerCard';
import { FormOrderCard } from './FormOrderCard';
import { FormShortAnswerCard } from './FormShortAnswerCard';
import { FormSingleAnswerCard } from './FormSingleAnswerCard';
import { FormSingleAnswerRadioCard } from './FormSingleAnswerRadioCard';
import { FormSliderCard } from './FormSliderCard';
import { FormTimeCard } from './FormTimeCard';

import { QuestionType } from '~/framework/modules/form/model';

export const getQuestionCard = (questionType: QuestionType) => {
  switch (questionType) {
    default:
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
    case QuestionType.MATRIX:
      return FormMatrixCard;
    case QuestionType.SLIDER:
      return FormSliderCard;
    case QuestionType.ORDER:
      return FormOrderCard;
  }
};
