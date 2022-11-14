import I18n from 'i18n-js';
import React from 'react';

import { FormQuestionCard } from '~/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionResponse } from '~/modules/form/reducer';
import Dropdown from '~/ui/Dropdown';

import { FormAnswerText } from './FormAnswerText';

interface IFormSingleAnswerCardProps {
  isDisabled: boolean;
  question: IQuestion;
  responses: IQuestionResponse[];
  onChangeAnswer: (questionId: number, newResponses: IQuestionResponse[]) => void;
  onEditQuestion?: () => void;
}

export const FormSingleAnswerCard = ({
  isDisabled,
  question,
  responses,
  onChangeAnswer,
  onEditQuestion,
}: IFormSingleAnswerCardProps) => {
  const [value, setValue] = React.useState(responses[0]?.choiceId?.toString());
  const items = question.choices.map(choice => {
    return {
      id: choice.id.toString(),
      value: choice.value,
    };
  });
  const { title, mandatory } = question;

  React.useEffect(() => {
    if (!value) return;
    const choiceId = Number(value);
    const answer = question.choices.find(choice => choice.id === choiceId)?.value ?? '';

    if (responses.length) {
      responses[0].choiceId = choiceId;
      responses[0].answer = answer;
    } else {
      responses.push({
        choiceId,
        answer,
        questionId: question.id,
      });
    }
    onChangeAnswer(question.id, responses);
  }, [value]);

  return (
    <FormQuestionCard title={title} isMandatory={mandatory} onEditQuestion={onEditQuestion}>
      {isDisabled ? (
        <FormAnswerText answer={responses[0]?.answer} />
      ) : (
        <Dropdown
          data={items}
          value={value}
          onSelect={v => setValue(v)}
          placeholder={I18n.t('form.selectAnOption')}
          showPlaceholderItem={value === undefined}
          keyExtractor={item => item.id}
          renderItem={item => item.value}
        />
      )}
    </FormQuestionCard>
  );
};
