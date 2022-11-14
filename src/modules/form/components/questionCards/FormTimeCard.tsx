import moment from 'moment';
import React from 'react';
import { StyleSheet } from 'react-native';

import { FormQuestionCard } from '~/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionResponse } from '~/modules/form/reducer';
import DateTimePicker from '~/ui/DateTimePicker';

import { FormAnswerText } from './FormAnswerText';

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

export const FormTimeCard = ({ isDisabled, question, responses, onChangeAnswer, onEditQuestion }: IFormTimeCardProps) => {
  const backendFormat = 'HH:mm';
  const [time, setTime] = React.useState(responses[0]?.answer ? moment(responses[0].answer, backendFormat) : moment());
  const { title, mandatory } = question;

  const onChangeTime = (value: moment.Moment) => {
    setTime(value);
    if (responses.length) {
      responses[0].answer = value.format(backendFormat);
    } else {
      responses.push({
        questionId: question.id,
        answer: value.format(backendFormat),
      });
    }
    onChangeAnswer(question.id, responses);
  };

  return (
    <FormQuestionCard title={title} isMandatory={mandatory} onEditQuestion={onEditQuestion}>
      {isDisabled ? (
        <FormAnswerText answer={responses[0]?.answer} />
      ) : (
        <DateTimePicker mode="time" value={time} onChange={value => onChangeTime(value)} style={styles.timePicker} />
      )}
    </FormQuestionCard>
  );
};
