import React from 'react';
import { FlatList, NativeScrollEvent, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';
import { FormQuestionCard } from '~/framework/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionChoice, IQuestionResponse, QuestionType } from '~/framework/modules/form/model';

import { FormAnswerText } from './FormAnswerText';
import { FormCheckbox } from './FormCheckbox';
import { FormRadio } from './FormRadio';

const questionCellWidth = 100;
const choiceCellWidth = 100;
const cellMinHeight = 50;

const styles = StyleSheet.create({
  scrollViewContent: {
    marginBottom: UI_SIZES.spacing.minor,
  },
  scrollViewShadow: {
    position: 'absolute',
    right: -UI_SIZES.spacing.small,
    width: UI_SIZES.spacing.small,
    height: '100%',
    backgroundColor: theme.ui.background.card,
    shadowColor: theme.ui.background.card,
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    minHeight: cellMinHeight,
    backgroundColor: theme.palette.grey.fog,
    borderRadius: UI_SIZES.radius.small,
    marginBottom: UI_SIZES.spacing.tiny,
  },
  hiddenQuestionContainer: {
    textAlign: 'center',
    width: questionCellWidth,
    minHeight: cellMinHeight,
  },
  choiceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: choiceCellWidth,
  },
  headerContainer: {
    flexDirection: 'row',
    minHeight: cellMinHeight,
    marginBottom: UI_SIZES.spacing.tiny,
    marginLeft: questionCellWidth,
  },
  choiceText: {
    textAlign: 'center',
  },
  hiddenHeaderContainer: {
    position: 'absolute',
    width: questionCellWidth,
    height: '50%',
    backgroundColor: theme.ui.background.card,
  },
  titlesContainer: {
    position: 'absolute',
    bottom: UI_SIZES.spacing.small,
    width: questionCellWidth,
    backgroundColor: theme.ui.background.card,
  },
  questionContainer: {
    justifyContent: 'center',
    width: questionCellWidth,
    minHeight: cellMinHeight,
    backgroundColor: theme.palette.grey.fog,
    borderTopLeftRadius: UI_SIZES.radius.small,
    borderBottomLeftRadius: UI_SIZES.radius.small,
    marginTop: UI_SIZES.spacing.tiny,
  },
  questionContainerShadow: {
    shadowColor: theme.ui.shadowColor,
    shadowOffset: { width: 3, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  questionText: {
    textAlign: 'center',
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
    const { questionId, choiceId } = response;
    if (values[response.questionId]) {
      values[questionId].push(choiceId!);
    } else {
      values[questionId] = [choiceId!];
    }
  }
  return values;
};

export const FormMatrixCard = ({ isDisabled, question, responses, onChangeAnswer, onEditQuestion }: IFormMatrixCardProps) => {
  const [values, setValues] = React.useState<{ [key: string]: number[] }>(getResponseValues(responses));
  const { title, mandatory, choices, children } = question;
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
        questionId: child.id,
        answer: choice.value,
        choiceId: choice.id,
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
        choiceId: choice.id,
        answer: choice.value,
        questionId: child.id,
      });
    }
    onChangeAnswer(child.id, res);
  };

  const updateShadows = (nativeEvent: NativeScrollEvent) => {
    const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;

    setQuestionShadowVisible(contentOffset.x > 0);
    setEndShadowVisible(contentOffset.x + layoutMeasurement.width < contentSize.width);
  };

  return (
    <FormQuestionCard title={title} isMandatory={mandatory} onEditQuestion={onEditQuestion}>
      {isDisabled && (!responses.length || !responses[0].choiceId) ? (
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
              renderItem={({ item, index }) => (
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
