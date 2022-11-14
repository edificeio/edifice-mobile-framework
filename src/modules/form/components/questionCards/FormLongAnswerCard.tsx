import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { extractTextFromHtml } from '~/framework/util/htmlParser/content';
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
    height: 140,
    color: theme.ui.text.regular,
    textAlignVertical: 'top',
  },
});

interface IFormLongAnswerCardProps {
  isDisabled: boolean;
  question: IQuestion;
  responses: IQuestionResponse[];
  onChangeAnswer: (questionId: number, newResponses: IQuestionResponse[]) => void;
  onEditQuestion?: () => void;
}

export const FormLongAnswerCard = ({
  isDisabled,
  question,
  responses,
  onChangeAnswer,
  onEditQuestion,
}: IFormLongAnswerCardProps) => {
  const [value, setValue] = React.useState(extractTextFromHtml(responses[0]?.answer) ?? '');
  const { title, mandatory, placeholder } = question;

  const onChangeTextCallback = (text: string) => {
    setValue(text);
    if (responses[0]) {
      responses[0].answer = `<div style="" class="ng-scope">${text.replace(/\n/g, '<br>')}</div>`;
    } else {
      responses.push({
        questionId: question.id,
        answer: `<div style="" class="ng-scope">${text.replace(/\n/g, '<br>')}</div>`,
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
          multiline
          style={styles.textInput}
        />
      )}
    </FormQuestionCard>
  );
};
