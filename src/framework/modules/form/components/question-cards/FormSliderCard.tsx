import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import Slider from '@react-native-community/slider';

import { FormAnswerText } from './FormAnswerText';

import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { CaptionText, SmallText } from '~/framework/components/text';
import { FormQuestionCard } from '~/framework/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionResponse } from '~/framework/modules/form/model';

const styles = StyleSheet.create({
  labelContainer: {
    maxWidth: '30%',
  },
  labelText: {
    color: theme.ui.text.light,
    textAlign: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: UI_SIZES.spacing.minor,
  },
  sliderMargin: {
    paddingTop: UI_SIZES.spacing.medium,
  },
  valueContainer: {
    alignItems: 'center',
    position: 'absolute',
    top: -25,
    width: 100,
  },
});

interface IFormSliderCardProps {
  isDisabled: boolean;
  question: IQuestion;
  responses: IQuestionResponse[];
  onChangeAnswer: (questionId: number, newResponses: IQuestionResponse[]) => void;
  onEditQuestion?: () => void;
}

const getDefaultValue = (min: number, max: number, step: number) => {
  const half = Math.round((max - min) / 2 + min);
  return (half / step) * step;
};

export const FormSliderCard = ({ isDisabled, onChangeAnswer, onEditQuestion, question, responses }: IFormSliderCardProps) => {
  const { cursorMaxLabel, cursorMaxVal = 100, cursorMinLabel, cursorMinVal = 0, cursorStep = 1, mandatory, title } = question;
  const [value, setValue] = React.useState(
    responses[0]?.answer ? Number(responses[0]?.answer) : getDefaultValue(cursorMinVal, cursorMaxVal, cursorStep),
  );
  const [isLabelExpanded, setLabelExpanded] = React.useState(false);
  const position = ((value - cursorMinVal) / (cursorMaxVal - cursorMinVal)) * 100;
  const valuePosition = {
    left: `${position}%`,
    marginLeft: -50 + (position - 50) / -2,
  };

  React.useEffect(() => {
    if (responses[0]) {
      responses[0].answer = value.toString();
    } else {
      responses.push({
        answer: value.toString(),
        questionId: question.id,
      });
    }
    onChangeAnswer(question.id, responses);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

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
              />
            </View>
            <SmallText>{cursorMaxVal}</SmallText>
          </View>
          {cursorMinLabel || cursorMaxLabel ? (
            <View style={styles.rowContainer}>
              <TouchableOpacity
                onPress={() => setLabelExpanded(true)}
                disabled={isLabelExpanded}
                activeOpacity={1}
                style={styles.labelContainer}>
                <CaptionText numberOfLines={isLabelExpanded ? undefined : 2} style={styles.labelText}>
                  {cursorMinLabel}
                </CaptionText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLabelExpanded(true)}
                disabled={isLabelExpanded}
                activeOpacity={1}
                style={styles.labelContainer}>
                <CaptionText numberOfLines={isLabelExpanded ? undefined : 2} style={styles.labelText}>
                  {cursorMaxLabel}
                </CaptionText>
              </TouchableOpacity>
            </View>
          ) : null}
        </>
      )}
    </FormQuestionCard>
  );
};
