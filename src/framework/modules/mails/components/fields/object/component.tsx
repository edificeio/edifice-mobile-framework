import * as React from 'react';
import { TextInput as RNTextInput, View } from 'react-native';

import styles from '../styles';
import { MailsObjectFieldProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { MailsEditType } from '~/framework/modules/mails/screens/edit';

export const MailsObjectField = (props: MailsObjectFieldProps) => {
  const { subject, type } = props;
  const [value, setValue] = React.useState('');

  React.useEffect(() => {
    let formatSubject = '';
    if (type === MailsEditType.FORWARD) formatSubject = `${I18n.get('mails-edit-subjectforward')} ${subject ?? ''}`;
    else if (type === MailsEditType.REPLY) formatSubject = `${I18n.get('mails-edit-subjectreply')} ${subject ?? ''}`;
    else formatSubject = subject ?? '';
    setValue(formatSubject);
    props.onChangeText(formatSubject);
  }, []);

  const onChangeText = text => {
    setValue(text);
    props.onChangeText(text);
  };

  return (
    <View style={styles.container}>
      <RNTextInput
        style={styles.input}
        placeholderTextColor={theme.palette.grey.graphite}
        placeholder={I18n.get('mails-edit-objectplaceholder')}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};
