import React from 'react';

import { FormQuestionCard } from '~/framework/modules/form/components/FormQuestionCard';
import { IQuestion } from '~/framework/modules/form/model';
import HtmlContentView from '~/ui/HtmlContentView';

interface IFormFreeTextCardProps {
  question: IQuestion;
}

export const FormFreeTextCard = ({ question }: IFormFreeTextCardProps) => {
  const { statement, title } = question;
  return <FormQuestionCard title={title}>{statement ? <HtmlContentView html={question.statement} /> : null}</FormQuestionCard>;
};
