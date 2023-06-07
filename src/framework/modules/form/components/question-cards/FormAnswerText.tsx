import React from 'react';

import { I18n } from '~/app/i18n';
import { CaptionItalicText, SmallText } from '~/framework/components/text';

interface IFormAnswerTextProps {
  answer?: string;
}

export const FormAnswerText = ({ answer = '' }: IFormAnswerTextProps) => {
  return answer !== '' ? (
    <SmallText>{answer}</SmallText>
  ) : (
    <CaptionItalicText>{I18n.get('form-distributionscreen-questioncard-notanswered')}</CaptionItalicText>
  );
};
