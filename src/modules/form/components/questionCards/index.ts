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

export const getQuestionCard = (questionType: number) => {
  switch (questionType) {
    case 1:
      return FormFreeTextCard;
    case 2:
      return FormShortAnswerCard;
    case 3:
      return FormLongAnswerCard;
    case 4:
      return FormSingleAnswerCard;
    case 5:
      return FormMultipleAnswerCard;
    case 6:
      return FormDateCard;
    case 7:
      return FormTimeCard;
    case 8:
      return FormFileCard;
    case 9:
      return FormSingleAnswerRadioCard;
    case 11:
      return FormSliderCard;
    default:
      return FormFreeTextCard;
  }
};
