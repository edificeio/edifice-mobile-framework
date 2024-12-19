import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { FormAnswerText } from './FormAnswerText';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { FormQuestionCard } from '~/framework/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionResponse } from '~/framework/modules/form/model';

const styles = StyleSheet.create({
  textInput: {
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderRadius: 5,
    borderWidth: 1,
    color: theme.ui.text.regular,
    padding: UI_SIZES.spacing.small,
  },
});

interface IFormShortAnswerCardProps {
  isDisabled: boolean;
  question: IQuestion;
  responses: IQuestionResponse[];
  onChangeAnswer: (questionId: number, newResponses: IQuestionResponse[]) => void;
  onEditQuestion?: () => void;
}

export const FormShortAnswerCard = ({
  isDisabled,
  onChangeAnswer,
  onEditQuestion,
  question,
  responses,
}: IFormShortAnswerCardProps) => {
  const [value, setValue] = React.useState(responses[0]?.answer ?? '');
  const { mandatory, placeholder, title } = question;

  const onChangeTextCallback = (text: string) => {
    setValue(text);
    if (responses[0]) {
      responses[0].answer = text;
    } else {
      responses.push({
        answer: text,
        questionId: question.id,
      });
    }
    onChangeAnswer(question.id, responses);
  };

  return (
    <FormQuestionCard title={title} isMandatory={mandatory} onEditQuestion={onEditQuestion}>
      {isDisabled ? (
        <FormAnswerText answer={value} />
      ) : (
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={text => onChangeTextCallback(text)}
          style={styles.textInput}
        />
      )}
    </FormQuestionCard>
  );
};
