import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import moment, { Moment } from 'moment';

import { FormAnswerText } from './FormAnswerText';

import { I18n } from '~/app/i18n';
import DateTimePicker from '~/framework/components/dateTimePicker';
import { SmallActionText } from '~/framework/components/text';
import { FormQuestionCard } from '~/framework/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionResponse } from '~/framework/modules/form/model';

const styles = StyleSheet.create({
  timePicker: {
    alignSelf: 'flex-start',
  },
});

interface IFormTimeCardProps {
  isDisabled: boolean;
  question: IQuestion;
  responses: IQuestionResponse[];
  onChangeAnswer: (questionId: number, newResponses: IQuestionResponse[]) => void;
  onEditQuestion?: () => void;
}

export const FormTimeCard = ({ isDisabled, onChangeAnswer, onEditQuestion, question, responses }: IFormTimeCardProps) => {
  const backendFormat = 'HH:mm';
  const [time, setTime] = React.useState(responses[0]?.answer ? moment(responses[0].answer, backendFormat) : moment());
  const { mandatory, title } = question;

  const onChangeTime = (value: Moment) => {
    setTime(value);
    if (responses.length) {
      responses[0].answer = value.format(backendFormat);
    } else {
      responses.push({
        answer: value.format(backendFormat),
        questionId: question.id,
      });
    }
    onChangeAnswer(question.id, responses);
  };

  const clearAnswer = () => {
    responses[0].answer = '';
    onChangeAnswer(question.id, responses);
  };

  return (
    <FormQuestionCard
      title={title}
      isMandatory={mandatory}
      onClearAnswer={responses[0]?.answer && !isDisabled ? clearAnswer : undefined}
      onEditQuestion={onEditQuestion}>
      {isDisabled ? (
        <FormAnswerText answer={responses[0]?.answer} />
      ) : responses[0]?.answer ? (
        <DateTimePicker mode="time" value={time} onChangeValue={value => onChangeTime(value)} style={styles.timePicker} />
      ) : (
        <TouchableOpacity onPress={() => onChangeTime(moment())}>
          <SmallActionText>{I18n.get('form-distribution-timecard-entertime')}</SmallActionText>
        </TouchableOpacity>
      )}
    </FormQuestionCard>
  );
};
