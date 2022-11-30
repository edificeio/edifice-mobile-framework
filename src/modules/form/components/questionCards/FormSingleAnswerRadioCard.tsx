import I18n from 'i18n-js';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
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
  customAnswerInput: {
    flex: 1,
    marginLeft: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.tiny,
    color: theme.ui.text.regular,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey.grey,
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
  const [customAnswer, setCustomAnswer] = React.useState(responses[0]?.customAnswer ?? '');
  const { title, mandatory, choices } = question;

  const onChangeChoice = (choice: IQuestionChoice) => {
    setValue(choice.id);
    if (responses.length) {
      responses[0].answer = choice.value ?? '';
      responses[0].choiceId = choice.id;
      responses[0].customAnswer = choice.isCustom ? customAnswer : undefined;
    } else {
      responses.push({
        questionId: question.id,
        answer: choice.value ?? '',
        choiceId: choice.id,
        customAnswer: choice.isCustom ? customAnswer : undefined,
      });
    }
    onChangeAnswer(question.id, responses);
  };

  const onChangeCustomAnswer = (text: string, choice: IQuestionChoice) => {
    setCustomAnswer(text);
    if (value !== choice.id) {
      onChangeChoice(choice);
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
              onPress={() => onChangeChoice(item)}
              disabled={isDisabled}
              style={[styles.answerContainer, index > 0 && styles.containerMargin]}>
              <FormRadio active={item.id === value} disabled={isDisabled} />
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
