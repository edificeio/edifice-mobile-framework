import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import FlatList from '~/framework/components/flatList';
import { SmallText } from '~/framework/components/text';
import { FormQuestionCard } from '~/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionChoice, IQuestionResponse } from '~/modules/form/reducer';

import { FormAnswerText } from './FormAnswerText';
import { FormCheckbox } from './FormCheckbox';

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

interface IFormMultipleAnswerCardProps {
  isDisabled: boolean;
  question: IQuestion;
  responses: IQuestionResponse[];
  onChangeAnswer: (questionId: number, newResponses: IQuestionResponse[]) => void;
  onEditQuestion?: () => void;
}

export const FormMultipleAnswerCard = ({
  isDisabled,
  question,
  responses,
  onChangeAnswer,
  onEditQuestion,
}: IFormMultipleAnswerCardProps) => {
  const [selectedChoices, setSelectedChoices] = React.useState<number[]>(responses.map(response => response.choiceId!));
  const { title, mandatory, choices } = question;

  const onSelectChoice = (choice: IQuestionChoice) => {
    const { id, value } = choice;
    if (selectedChoices.includes(id)) {
      setSelectedChoices(selectedChoices.filter(choiceId => choiceId !== id));
      responses = responses.filter(response => response.choiceId !== id);
    } else {
      setSelectedChoices([...selectedChoices, id]);
      responses.push({
        choiceId: id,
        answer: value ?? '',
        questionId: question.id,
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
              onPress={() => onSelectChoice(item)}
              disabled={isDisabled}
              style={[styles.answerContainer, index > 0 && styles.containerMargin]}>
              <FormCheckbox checked={selectedChoices.includes(item.id)} disabled={isDisabled} />
              <SmallText style={styles.answerText}>{item.value}</SmallText>
            </TouchableOpacity>
          )}
          bottomInset={false}
        />
      )}
    </FormQuestionCard>
  );
};
