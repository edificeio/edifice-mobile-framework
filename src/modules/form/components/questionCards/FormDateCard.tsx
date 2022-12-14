import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { SmallActionText } from '~/framework/components/text';
import { FormQuestionCard } from '~/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionResponse } from '~/modules/form/reducer';
import DateTimePicker from '~/ui/DateTimePicker';

import { FormAnswerText } from './FormAnswerText';

const styles = StyleSheet.create({
  datePicker: {
    alignSelf: 'flex-start',
  },
});

interface IFormDateCardProps {
  isDisabled: boolean;
  question: IQuestion;
  responses: IQuestionResponse[];
  onChangeAnswer: (questionId: number, newResponses: IQuestionResponse[]) => void;
  onEditQuestion?: () => void;
}

export const FormDateCard = ({ isDisabled, question, responses, onChangeAnswer, onEditQuestion }: IFormDateCardProps) => {
  const backendFormat = 'DD/MM/YYYY';
  const [date, setDate] = React.useState(responses[0]?.answer ? moment(responses[0].answer, backendFormat) : moment());
  const { title, mandatory } = question;

  const onChangeDate = (value: moment.Moment) => {
    setDate(value);
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
      ) : responses[0]?.answer ? (
        <DateTimePicker mode="date" value={date} onChange={value => onChangeDate(value)} style={styles.datePicker} />
      ) : (
        <TouchableOpacity onPress={() => onChangeDate(moment())}>
          <SmallActionText>{I18n.t('common.enterDate')}</SmallActionText>
        </TouchableOpacity>
      )}
    </FormQuestionCard>
  );
};
