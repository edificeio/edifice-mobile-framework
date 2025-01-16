import * as React from 'react';
import { TextInput as RNTextInput, View } from 'react-native';

import styles from '../styles';
import { MailsObjectFieldProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { MailsEditType } from '~/framework/modules/mails/screens/edit';

export const MailsObjectField = (props: MailsObjectFieldProps) => {
  const { subject, type } = props;
  const [value, setValue] = React.useState<string>('');

  React.useEffect(() => {
    if (type === MailsEditType.FORWARD) return setValue(`${I18n.get('mails-edit-subjectforward')} ${subject ?? ''}`);
    if (type === MailsEditType.REPLY) return setValue(`${I18n.get('mails-edit-subjectreply')} ${subject ?? ''}`);
    return setValue(subject ?? '');
  }, [subject, type]);

  const onChangeText = text => {
    setValue(text);
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
