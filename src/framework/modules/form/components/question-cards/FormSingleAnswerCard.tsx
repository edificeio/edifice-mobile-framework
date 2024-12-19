import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { FormAnswerText } from './FormAnswerText';
import Dropdown from './FormDropdown';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { FormQuestionCard } from '~/framework/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionChoice, IQuestionResponse } from '~/framework/modules/form/model';

const styles = StyleSheet.create({
  customAnswerInput: {
    borderBottomColor: theme.palette.grey.grey,
    borderBottomWidth: 1,
    color: theme.ui.text.regular,
    flex: 1,
    marginTop: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.tiny,
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
      value: I18n.get('form-distribution-singleanswercard-selectoption'),
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
  onChangeAnswer,
  onEditQuestion,
  question,
  responses,
}: IFormSingleAnswerCardProps) => {
  const [items] = React.useState(mapDropdownItems(question.choices));
  const [value, setValue] = React.useState(responses[0]?.choiceId);
  const [customAnswer, setCustomAnswer] = React.useState(responses[0]?.customAnswer ?? '');
  let selectedChoice = question.choices.find(c => c.id === value);
  const { mandatory, title } = question;

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
        answer,
        choiceId,
        customAnswer: selectedChoice?.isCustom ? customAnswer : undefined,
        questionId: question.id,
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
              placeholder={I18n.get('form-distribution-questioncard-enteryouranswer')}
              style={styles.customAnswerInput}
            />
          ) : null}
        </View>
      )}
    </FormQuestionCard>
  );
};
