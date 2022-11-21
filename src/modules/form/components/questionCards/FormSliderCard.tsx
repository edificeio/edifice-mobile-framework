import Slider from '@react-native-community/slider';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { CaptionText, SmallText } from '~/framework/components/text';
import { FormQuestionCard } from '~/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionResponse } from '~/modules/form/reducer';

import { FormAnswerText } from './FormAnswerText';

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderMargin: {
    paddingTop: UI_SIZES.spacing.medium,
  },
  valueContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 100,
    top: -25,
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: UI_SIZES.spacing.minor,
  },
  labelText: {
    maxWidth: '30%',
    textAlign: 'center',
    color: theme.ui.text.light,
  },
});

interface IFormSliderCardProps {
  isDisabled: boolean;
  question: IQuestion;
  responses: IQuestionResponse[];
  onChangeAnswer: (questionId: number, newResponses: IQuestionResponse[]) => void;
  onEditQuestion?: () => void;
}

export const FormSliderCard = ({ isDisabled, question, responses, onChangeAnswer, onEditQuestion }: IFormSliderCardProps) => {
  const { title, mandatory, cursorMinVal = 0, cursorMaxVal = 100, cursorStep, cursorLabelMinVal, cursorLabelMaxVal } = question;
  const [value, setValue] = React.useState(responses[0]?.answer ? Number(responses[0]?.answer) : cursorMinVal);
  const position = ((value - cursorMinVal) / (cursorMaxVal - cursorMinVal)) * 100;
  const valuePosition = {
    left: `${position}%`,
    marginLeft: -50 + (position - 50) / -2,
  };

  const onChangeValue = (v: number) => {
    setValue(v);
    if (responses[0]) {
      responses[0].answer = v.toString();
    } else {
      responses.push({
        questionId: question.id,
        answer: v.toString(),
      });
    }
    onChangeAnswer(question.id, responses);
  };

  return (
    <FormQuestionCard title={title} isMandatory={mandatory} onEditQuestion={onEditQuestion}>
      {isDisabled ? (
        <FormAnswerText answer={responses[0]?.answer} />
      ) : (
        <>
          <View style={[styles.rowContainer, styles.sliderMargin]}>
            <SmallText>{cursorMinVal}</SmallText>
            <View style={UI_STYLES.flex1}>
              {value !== cursorMinVal && value !== cursorMaxVal ? (
                <View style={[styles.valueContainer, valuePosition]}>
                  <SmallText>{value}</SmallText>
                </View>
              ) : null}
              <Slider
                value={value}
                minimumValue={cursorMinVal}
                maximumValue={cursorMaxVal}
                step={cursorStep}
                minimumTrackTintColor={theme.palette.primary.regular.toString()}
                style={styles.sliderContainer}
                onValueChange={v => setValue(v)}
                onSlidingComplete={v => onChangeValue(v)}
              />
            </View>
            <SmallText>{cursorMaxVal}</SmallText>
          </View>
          {cursorLabelMinVal || cursorLabelMaxVal ? (
            <View style={styles.rowContainer}>
              <CaptionText numberOfLines={2} style={styles.labelText}>
                {cursorLabelMinVal}
              </CaptionText>
              <CaptionText numberOfLines={2} style={styles.labelText}>
                {cursorLabelMaxVal}
              </CaptionText>
            </View>
          ) : null}
        </>
      )}
    </FormQuestionCard>
  );
};
