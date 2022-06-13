import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

import theme from '~/app/theme';

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    color: theme.palette.grey.white,
    fontSize: 16,
  },
});

export const Input = ({ value, onChange }: { value: string; onChange: (text: string) => void }) => {
  const textUpdateTimeout = React.useRef();
  const [currentValue, updateCurrentValue] = React.useState(value);

  React.useEffect(() => {
    window.clearTimeout(textUpdateTimeout.current);
    textUpdateTimeout.current = window.setTimeout(() => onChange(currentValue), 500);

    return () => {
      window.clearTimeout(textUpdateTimeout.current);
    };
  }, [currentValue]);

  return (
    <TextInput
      style={styles.textInput}
      placeholder={I18n.t('Search')}
      placeholderTextColor={theme.palette.grey.white}
      numberOfLines={1}
      defaultValue={currentValue}
      onChangeText={text => updateCurrentValue(text)}
    />
  );
};
