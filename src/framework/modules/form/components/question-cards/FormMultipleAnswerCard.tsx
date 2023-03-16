import I18n from 'i18n-js';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import FlatList from '~/framework/components/flatList';
import { SmallText } from '~/framework/components/text';
import { FormQuestionCard } from '~/framework/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionChoice, IQuestionResponse } from '~/framework/modules/form/model';

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
  customAnswerInput: {
    flex: 1,
    marginLeft: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.tiny,
    color: theme.ui.text.regular,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey.grey,
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
  const [customAnswer, setCustomAnswer] = React.useState(responses[0]?.customAnswer ?? '');
  const { title, mandatory, choices } = question;

  const onSelectChoice = (choice: IQuestionChoice) => {
    const { id, value } = choice;
    if (selectedChoices.includes(id)) {
      setSelectedChoices(selectedChoices.filter(choiceId => choiceId !== id));
      //responses = responses.filter(response => response.choiceId !== id);
      responses = responses.map(r => {
        if (r.choiceId === choice.id) {
          r.toDelete = true;
        }
        return r;
      });
    } else {
      // AMV2-472 temporary fix until form web 1.6.0
      if (responses.length === 1 && !responses[0].choiceId) {
        responses[0].toDelete = true;
      }
      setSelectedChoices([...selectedChoices, id]);
      //responses = responses.filter(r => r.choiceId);
      responses.push({
        questionId: question.id,
        answer: value,
        choiceId: id,
        customAnswer: choice.isCustom ? customAnswer : undefined,
      });
    }
    onChangeAnswer(question.id, responses);
  };

  const onChangeCustomAnswer = (text: string, choice: IQuestionChoice) => {
    setCustomAnswer(text);
    if (!selectedChoices.includes(choice.id)) {
      onSelectChoice(choice);
    }
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
              <SmallText style={[styles.answerText, !item.isCustom && UI_STYLES.flex1]}>{item.value}</SmallText>
              {item.isCustom ? (
                <TextInput
                  value={customAnswer}
                  onChangeText={text => onChangeCustomAnswer(text, item)}
                  editable={!isDisabled}
                  placeholder={I18n.t('form.enterYourAnswer')}
                  style={styles.customAnswerInput}
                />
              ) : null}
            </TouchableOpacity>
          )}
          bottomInset={false}
        />
      )}
    </FormQuestionCard>
  );
};
