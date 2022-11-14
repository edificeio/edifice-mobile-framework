import Slider from '@react-native-community/slider';
import I18n from 'i18n-js';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
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
  labelText: {
    maxWidth: '30%',
    textAlign: 'center',
    color: theme.ui.text.light,
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: UI_SIZES.spacing.minor,
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
  const { title, mandatory, cursorMinVal, cursorMaxVal, cursorStep, cursorLabelMinVal, cursorLabelMaxVal } = question;
  const [value, setValue] = React.useState(Number(responses[0]?.answer) ?? cursorMinVal);

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
          <View style={styles.rowContainer}>
            <SmallText>{cursorMinVal}</SmallText>
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
            <SmallText>{cursorMaxVal}</SmallText>
          </View>
          <SmallText>{I18n.t('form.selectedValue', { value })}</SmallText>
        </>
      )}
    </FormQuestionCard>
  );
};
