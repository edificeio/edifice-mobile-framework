import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import { FormQuestionCard } from '~/framework/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionChoice, IQuestionResponse } from '~/framework/modules/form/model';

import { FormAnswerText } from './FormAnswerText';

const styles = StyleSheet.create({
  choiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: UI_SIZES.spacing.minor,
    marginVertical: UI_SIZES.spacing.tiny,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
    borderRadius: UI_SIZES.radius.medium,
  },
  valueText: {
    flex: 1,
    marginLeft: UI_SIZES.spacing.minor,
  },
  listContainer: {
    overflow: 'visible',
  },
});

interface IFormOrderCardProps {
  isDisabled: boolean;
  question: IQuestion;
  responses: IQuestionResponse[];
  onChangeAnswer: (questionId: number, newResponses: IQuestionResponse[]) => void;
  onEditQuestion?: () => void;
}

const sortChoices = (choices: IQuestionChoice[], answer?: string) => {
  if (!answer) {
    return choices;
  }
  const result: IQuestionChoice[] = [];
  const choiceIds = answer
    .replace(/\[|\]|/g, '')
    .split(',')
    .map(Number);

  for (const choiceId of choiceIds) {
    const choice = choices.find(c => c.id === choiceId);
    if (choice) {
      result.push(choice);
    }
  }
  return result;
};

export const FormOrderCard = ({ isDisabled, question, responses, onChangeAnswer, onEditQuestion }: IFormOrderCardProps) => {
  const [choices, setChoices] = React.useState<IQuestionChoice[]>(sortChoices(question.choices, responses[0]?.answer));
  const { title, mandatory } = question;

  React.useEffect(() => {
    const answer = `[${choices.map(choice => choice.id).join(',')}]`;

    if (responses.length) {
      responses[0].answer = answer;
    } else {
      responses.push({
        answer,
        questionId: question.id,
      });
    }
    onChangeAnswer(question.id, responses);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choices]);

  const renderItem = ({ item, drag, isActive }: RenderItemParams<IQuestionChoice>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onPressIn={drag}
          disabled={isDisabled || isActive}
          style={[styles.choiceContainer, { backgroundColor: isActive ? theme.palette.grey.pearl : theme.palette.grey.fog }]}>
          <Picture
            type="NamedSvg"
            name="ui-drag"
            fill={isDisabled ? theme.palette.grey.grey : theme.palette.grey.black}
            width={18}
            height={18}
          />
          <SmallText style={styles.valueText}>{item.value}</SmallText>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <FormQuestionCard title={title} isMandatory={mandatory} onEditQuestion={onEditQuestion}>
      {isDisabled && (!responses.length || !responses[0].answer) ? (
        <FormAnswerText />
      ) : (
        <DraggableFlatList
          data={choices}
          onDragEnd={({ data }) => setChoices(data)}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          style={styles.listContainer}
        />
      )}
    </FormQuestionCard>
  );
};
