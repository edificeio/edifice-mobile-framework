import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import FlatList from '~/framework/components/flatList';
import { SmallText } from '~/framework/components/text';
import { FormQuestionCard } from '~/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionChoice, IQuestionResponse } from '~/modules/form/reducer';

import { FormAnswerText } from './FormAnswerText';
import { FormRadio } from './FormRadio';

const styles = StyleSheet.create({
  answerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerMargin: {
    marginTop: UI_SIZES.spacing.minor,
  },
  answerText: {
    marginLeft: UI_SIZES.spacing.minor,
  },
});

interface IFormSingleAnswerRadioCardProps {
  isDisabled: boolean;
  question: IQuestion;
  responses: IQuestionResponse[];
  onChangeAnswer: (questionId: number, newResponses: IQuestionResponse[]) => void;
  onEditQuestion?: () => void;
}

export const FormSingleAnswerRadioCard = ({
  isDisabled,
  question,
  responses,
  onChangeAnswer,
  onEditQuestion,
}: IFormSingleAnswerRadioCardProps) => {
  const [value, setValue] = React.useState(responses[0]?.choiceId);
  const { title, mandatory, choices } = question;

  const onChangeChoice = (choice: IQuestionChoice) => {
    setValue(choice.id);
    if (responses.length) {
      responses[0].answer = choice.value ?? '';
      responses[0].choiceId = choice.id;
    } else {
      responses.push({
        questionId: question.id,
        answer: choice.value ?? '',
        choiceId: choice.id,
      });
    }
    onChangeAnswer(question.id, responses);
  };

  return (
    <FormQuestionCard title={title} isMandatory={mandatory} onEditQuestion={onEditQuestion}>
      {isDisabled && (!responses.length || !responses[0].choiceId) ? (
        <FormAnswerText />
      ) : (
        <FlatList
          data={choices}
          keyExtractor={choice => choice.id.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => onChangeChoice(item)}
              disabled={isDisabled}
              style={[styles.answerContainer, index > 0 && styles.containerMargin]}>
              <FormRadio active={item.id === value} disabled={isDisabled} />
              <SmallText style={styles.answerText}>{item.value}</SmallText>
            </TouchableOpacity>
          )}
          bottomInset={false}
        />
      )}
    </FormQuestionCard>
  );
};
