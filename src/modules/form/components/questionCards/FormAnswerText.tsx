import I18n from 'i18n-js';
import React from 'react';

import { CaptionItalicText, SmallText } from '~/framework/components/text';

interface IFormAnswerTextProps {
  answer?: string;
}

export const FormAnswerText = ({ answer = '' }: IFormAnswerTextProps) => {
  return answer !== '' ? <SmallText>{answer}</SmallText> : <CaptionItalicText>{I18n.t('form.notAnswered')}</CaptionItalicText>;
};
