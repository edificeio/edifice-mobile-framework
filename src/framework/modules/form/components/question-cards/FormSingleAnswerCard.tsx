import I18n from 'i18n-js';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { FormQuestionCard } from '~/framework/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionChoice, IQuestionResponse } from '~/framework/modules/form/model';

import { FormAnswerText } from './FormAnswerText';
import Dropdown from './FormDropdown';

const styles = StyleSheet.create({
  customAnswerInput: {
    flex: 1,
    marginTop: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.tiny,
    color: theme.ui.text.regular,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey.grey,
  },
});

interface IFormSingleAnswerCardProps {
  isDisabled: boolean;
  question: IQuestion;
  responses: IQuestionResponse[];
  onChangeAnswer: (questionId: number, newResponses: IQuestionResponse[]) => void;
  onEditQuestion?: () => void;
}

const mapDropdownItems = (choices: IQuestionChoice[]): { id?: string; value: string }[] => {
  return [
    {
      id: undefined,
      value: I18n.t('form.selectAnOption'),
    },
    ...choices.map(choice => {
      return {
        id: choice.id.toString(),
        value: choice.value,
      };
    }),
  ];
};

export const FormSingleAnswerCard = ({
  isDisabled,
  question,
  responses,
  onChangeAnswer,
  onEditQuestion,
}: IFormSingleAnswerCardProps) => {
  const [items] = React.useState(mapDropdownItems(question.choices));
  const [value, setValue] = React.useState(responses[0]?.choiceId);
  const [customAnswer, setCustomAnswer] = React.useState(responses[0]?.customAnswer ?? '');
  let selectedChoice = question.choices.find(c => c.id === value);
  const { title, mandatory } = question;

  const onChangeChoice = (choiceId?: number) => {
    setValue(choiceId);
    if (!choiceId) setCustomAnswer('');
    selectedChoice = question.choices.find(c => c.id === choiceId);
    const answer = selectedChoice?.value ?? '';

    if (responses.length) {
      responses[0].choiceId = choiceId;
      responses[0].answer = answer;
      responses[0].customAnswer = selectedChoice?.isCustom ? customAnswer : undefined;
    } else {
      responses.push({
        choiceId,
        answer,
        questionId: question.id,
        customAnswer: selectedChoice?.isCustom ? customAnswer : undefined,
      });
    }
    onChangeAnswer(question.id, responses);
  };

  const onChangeCustomAnswer = (text: string) => {
    setCustomAnswer(text);
    responses[0].customAnswer = text;
    onChangeAnswer(question.id, responses);
  };

  return (
    <FormQuestionCard title={title} isMandatory={mandatory} onEditQuestion={onEditQuestion}>
      {isDisabled ? (
        <FormAnswerText answer={selectedChoice?.isCustom ? responses[0]?.customAnswer : responses[0]?.answer} />
      ) : (
        <View>
          <Dropdown
            data={items}
            value={value?.toString()}
            onSelect={v => onChangeChoice(v ? Number(v) : undefined)}
            keyExtractor={item => item?.id}
            renderItem={item => item?.value}
          />
          {selectedChoice?.isCustom ? (
            <TextInput
              value={customAnswer}
              onChangeText={onChangeCustomAnswer}
              editable={!isDisabled}
              placeholder={I18n.t('form.enterYourAnswer')}
              style={styles.customAnswerInput}
            />
          ) : null}
        </View>
      )}
    </FormQuestionCard>
  );
};
