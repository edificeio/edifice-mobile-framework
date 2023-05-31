import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { FormQuestionCard } from '~/framework/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionResponse } from '~/framework/modules/form/model';
import { extractTextFromHtml } from '~/framework/util/htmlParser/content';

import { FormAnswerText } from './FormAnswerText';

const styles = StyleSheet.create({
  textInput: {
    minHeight: 140,
    padding: UI_SIZES.spacing.small,
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderWidth: 1,
    borderRadius: 5,
    color: theme.ui.text.regular,
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
    const answer = text ? `<div style="" class="ng-scope">${text.replace(/\n/g, '<br>')}</div>` : '';
    if (responses.length) {
      responses[0].answer = answer;
    } else {
      responses.push({
        questionId: question.id,
        answer,
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
