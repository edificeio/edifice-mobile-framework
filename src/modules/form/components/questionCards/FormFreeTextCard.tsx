import React from 'react';

import { FormQuestionCard } from '~/modules/form/components/FormQuestionCard';
import { IQuestion } from '~/modules/form/reducer';
import { HtmlContentView } from '~/ui/HtmlContentView';

interface IFormFreeTextCardProps {
  question: IQuestion;
}

export const FormFreeTextCard = ({ question }: IFormFreeTextCardProps) => {
  const { title, statement } = question;
  return <FormQuestionCard title={title}>{statement ? <HtmlContentView html={question.statement} /> : null}</FormQuestionCard>;
};
