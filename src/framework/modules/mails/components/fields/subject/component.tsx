import * as React from 'react';
import { TextInput as RNTextInput, View } from 'react-native';

import styles from '../styles';
import { MailsSubjectFieldProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { MailsEditType } from '~/framework/modules/mails/screens/edit';

export const MailsSubjectField = (props: MailsSubjectFieldProps) => {
  const { subject, type } = props;
  const [value, setValue] = React.useState('');

  React.useEffect(() => {
    let formatSubject = '';
    if (type === MailsEditType.FORWARD) formatSubject = `${I18n.get('mails-edit-subjectforward')} ${subject ?? ''}`;
    else if (type === MailsEditType.REPLY) formatSubject = `${I18n.get('mails-edit-subjectreply')} ${subject ?? ''}`;
    else formatSubject = subject ?? '';
    setValue(formatSubject);
    props.onChangeText(formatSubject);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeText = text => {
    setValue(text);
    props.onChangeText(text);
  };

  return (
    <View style={styles.container}>
      <RNTextInput
        style={[styles.input, styles.subjectInput]}
        placeholderTextColor={theme.palette.grey.graphite}
        placeholder={I18n.get('mails-edit-subjectplaceholder')}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};
