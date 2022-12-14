import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { FormQuestionCard } from '~/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionResponse } from '~/modules/form/reducer';

import { FormAnswerText } from './FormAnswerText';

const styles = StyleSheet.create({
  textInput: {
    padding: UI_SIZES.spacing.small,
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderWidth: 1,
    borderRadius: 5,
    color: theme.ui.text.regular,
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
  question,
  responses,
  onChangeAnswer,
  onEditQuestion,
}: IFormShortAnswerCardProps) => {
  const [value, setValue] = React.useState(responses[0]?.answer ?? '');
  const { title, mandatory, placeholder } = question;

  const onChangeTextCallback = (text: string) => {
    setValue(text);
    if (responses[0]) {
      responses[0].answer = text;
    } else {
      responses.push({
        questionId: question.id,
        answer: text,
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
