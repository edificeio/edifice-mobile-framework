import * as React from 'react';
import { TextInput as RNTextInput, View } from 'react-native';

import styles from '../styles';
import { MailsObjectFieldProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';

export const MailsObjectField = (props: MailsObjectFieldProps) => {
  return (
    <View style={styles.container}>
      <RNTextInput
        style={styles.input}
        placeholderTextColor={theme.palette.grey.graphite}
        placeholder={I18n.get('mails-edit-objectplaceholder')}
      />
    </View>
  );
};
