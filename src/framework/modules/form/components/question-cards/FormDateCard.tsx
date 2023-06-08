import moment from 'moment';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { I18n } from '~/app/i18n';
import { SmallActionText } from '~/framework/components/text';
import { FormQuestionCard } from '~/framework/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionResponse } from '~/framework/modules/form/model';
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
        <DateTimePicker mode="date" value={date} onChange={value => onChangeDate(value)} style={styles.datePicker} />
      ) : (
        <TouchableOpacity onPress={() => onChangeDate(moment())}>
          <SmallActionText>{I18n.get('form-distribution-datecard-enterdate')}</SmallActionText>
        </TouchableOpacity>
      )}
    </FormQuestionCard>
  );
};
