import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { FormAnswerText } from './FormAnswerText';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { FormQuestionCard } from '~/framework/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionResponse } from '~/framework/modules/form/model';
import { extractTextFromHtml } from '~/framework/util/htmlParser/content';

const styles = StyleSheet.create({
  textInput: {
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderRadius: 5,
    borderWidth: 1,
    color: theme.ui.text.regular,
    minHeight: 140,
    padding: UI_SIZES.spacing.small,
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
  onChangeAnswer,
  onEditQuestion,
  question,
  responses,
}: IFormLongAnswerCardProps) => {
  const [value, setValue] = React.useState(extractTextFromHtml(responses[0]?.answer) ?? '');
  const { mandatory, placeholder, title } = question;

  const onChangeTextCallback = (text: string) => {
    setValue(text);
    const answer = text ? `<div style="" class="ng-scope">${text.replace(/\n/g, '<br>')}</div>` : '';
    if (responses.length) {
      responses[0].answer = answer;
    } else {
      responses.push({
        answer,
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
          multiline
          scrollEnabled={false}
          textAlignVertical="top"
          style={styles.textInput}
        />
      )}
    </FormQuestionCard>
  );
};
