import React from 'react';
import { FlatList, NativeScrollEvent, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { FormAnswerText } from './FormAnswerText';
import { FormCheckbox } from './FormCheckbox';
import { FormRadio } from './FormRadio';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';
import { FormQuestionCard } from '~/framework/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionChoice, IQuestionResponse, QuestionType } from '~/framework/modules/form/model';

const CELL_MIN_HEIGHT = 50;
const CHOICE_CELL_WIDTH = 100;
const QUESTION_CELL_WIDTH = 100;

const styles = StyleSheet.create({
  choiceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: CHOICE_CELL_WIDTH,
  },
  choiceText: {
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.tiny,
    marginLeft: QUESTION_CELL_WIDTH,
    minHeight: CELL_MIN_HEIGHT,
  },
  hiddenHeaderContainer: {
    backgroundColor: theme.ui.background.card,
    height: '50%',
    position: 'absolute',
    width: QUESTION_CELL_WIDTH,
  },
  hiddenQuestionContainer: {
    minHeight: CELL_MIN_HEIGHT,
    textAlign: 'center',
    width: QUESTION_CELL_WIDTH,
  },
  itemContainer: {
    backgroundColor: theme.palette.grey.fog,
    borderRadius: UI_SIZES.radius.small,
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.tiny,
    minHeight: CELL_MIN_HEIGHT,
  },
  questionContainer: {
    backgroundColor: theme.palette.grey.fog,
    borderBottomLeftRadius: UI_SIZES.radius.small,
    borderTopLeftRadius: UI_SIZES.radius.small,
    justifyContent: 'center',
    marginTop: UI_SIZES.spacing.tiny,
    minHeight: CELL_MIN_HEIGHT,
    width: QUESTION_CELL_WIDTH,
  },
  questionContainerShadow: {
    elevation: 1,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: { height: 0, width: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  questionText: {
    textAlign: 'center',
  },
  scrollViewContent: {
    marginBottom: UI_SIZES.spacing.minor,
  },
  scrollViewShadow: {
    backgroundColor: theme.ui.background.card,
    elevation: 1,
    height: '100%',
    position: 'absolute',
    right: -UI_SIZES.spacing.small,
    shadowColor: theme.ui.background.card,
    shadowOffset: { height: 0, width: -5 },
    shadowOpacity: 1,
    shadowRadius: 5,
    width: UI_SIZES.spacing.small,
  },
  titlesContainer: {
    backgroundColor: theme.ui.background.card,
    bottom: UI_SIZES.spacing.small,
    position: 'absolute',
    width: QUESTION_CELL_WIDTH,
  },
});

interface IFormMatrixCardProps {
  isDisabled: boolean;
  question: IQuestion;
  responses: IQuestionResponse[];
  onChangeAnswer: (questionId: number, newResponses: IQuestionResponse[]) => void;
  onEditQuestion?: () => void;
}

const getResponseValues = (responses: IQuestionResponse[]): { [key: string]: number[] } => {
  const values: { [key: string]: number[] } = {};

  for (const response of responses) {
    const { choiceId, questionId } = response;
    if (values[response.questionId]) {
      values[questionId].push(choiceId!);
    } else {
      values[questionId] = [choiceId!];
    }
  }
  return values;
};

export const FormMatrixCard = ({ isDisabled, onChangeAnswer, onEditQuestion, question, responses }: IFormMatrixCardProps) => {
  const [values, setValues] = React.useState<{ [key: string]: number[] }>(getResponseValues(responses));
  const { children, choices, mandatory, title } = question;
  const [isQuestionShadowVisible, setQuestionShadowVisible] = React.useState(false);
  const [isEndShadowVisible, setEndShadowVisible] = React.useState(true);
  const [isSingleAnswer] = React.useState(question.children?.some(q => q.type === QuestionType.SINGLEANSWERRADIO));

  // Single answer
  const onChangeChoice = (child: IQuestion, choice: IQuestionChoice) => {
    values[child.id] = [choice.id];
    setValues(values);
    let response = responses.find(r => r.questionId === child.id);

    if (response) {
      response.answer = choice.value;
      response.choiceId = choice.id;
    } else {
      response = {
        answer: choice.value,
        choiceId: choice.id,
        questionId: child.id,
      };
    }
    onChangeAnswer(child.id, [response]);
  };

  // Multiple answer
  const onSelectChoice = (child: IQuestion, choice: IQuestionChoice) => {
    let res = responses.filter(r => r.questionId === child.id);

    if (values[child.id]?.includes(choice.id)) {
      values[child.id] = values[child.id].filter(id => id !== choice.id);
      res = res.filter(r => r.choiceId !== choice.id);
    } else {
      if (!values[child.id]) {
        values[child.id] = [choice.id];
      } else {
        values[child.id].push(choice.id);
      }
      setValues(values);
      res.push({
        answer: choice.value,
        choiceId: choice.id,
        questionId: child.id,
      });
    }
    onChangeAnswer(child.id, res);
  };

  const clearSingleAnswerMatrix = () => {
    setValues({});
    children?.forEach(child => {
      let response = responses.find(r => r.questionId === child.id);

      if (response) {
        response.answer = '';
        response.choiceId = undefined;
      } else {
        response = {
          answer: '',
          choiceId: undefined,
          questionId: child.id,
        };
      }
      onChangeAnswer(child.id, [response]);
    });
  };

  const updateShadows = (nativeEvent: NativeScrollEvent) => {
    const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;

    setQuestionShadowVisible(contentOffset.x > 0);
    setEndShadowVisible(contentOffset.x + layoutMeasurement.width < contentSize.width);
  };

  return (
    <FormQuestionCard
      title={title}
      isMandatory={mandatory}
      onClearAnswer={isSingleAnswer && responses.some(r => r.choiceId) && !isDisabled ? clearSingleAnswerMatrix : undefined}
      onEditQuestion={onEditQuestion}>
      {isDisabled && (!responses.length || responses.every(r => !r.choiceId)) ? (
        <FormAnswerText />
      ) : (
        <>
          <ScrollView
            horizontal
            persistentScrollbar
            bounces={false}
            onScroll={({ nativeEvent }) => updateShadows(nativeEvent)}
            onScrollEndDrag={({ nativeEvent }) => updateShadows(nativeEvent)}
            scrollEventThrottle={300}
            contentContainerStyle={styles.scrollViewContent}>
            <FlatList
              data={children}
              keyExtractor={child => child.id.toString()}
              renderItem={({ index, item }) => (
                <View style={styles.itemContainer}>
                  <SmallText style={styles.hiddenQuestionContainer}>{item.title}</SmallText>
                  {choices.map(choice => (
                    <TouchableOpacity
                      onPress={() => (isSingleAnswer ? onChangeChoice(item, choice) : onSelectChoice(item, choice))}
                      disabled={isDisabled}
                      style={styles.choiceContainer}
                      key={choice.id}>
                      {isSingleAnswer ? (
                        <FormRadio active={values[item.id]?.includes(choice.id)} disabled={isDisabled} />
                      ) : (
                        <FormCheckbox checked={values[item.id]?.includes(choice.id)} disabled={isDisabled} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              ListHeaderComponent={
                <View style={styles.headerContainer}>
                  {choices.map(choice => (
                    <View style={styles.choiceContainer} key={choice.id}>
                      <SmallText style={styles.choiceText}>{choice.value}</SmallText>
                    </View>
                  ))}
                </View>
              }
            />
          </ScrollView>
          {isEndShadowVisible ? <View style={styles.scrollViewShadow} /> : null}
          <View style={styles.hiddenHeaderContainer} />
          <View style={styles.titlesContainer}>
            {children?.map(child => (
              <View style={[styles.questionContainer, isQuestionShadowVisible && styles.questionContainerShadow]} key={child.id}>
                <SmallText style={styles.questionText}>{child.title}</SmallText>
              </View>
            ))}
          </View>
        </>
      )}
    </FormQuestionCard>
  );
};
