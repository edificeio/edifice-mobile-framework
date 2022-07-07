import React from 'react';
import { StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Text } from '~/framework/components/text';

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: theme.palette.secondary.regular,
    borderRadius: 2,
    marginLeft: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledOpacity: {
    opacity: 0.5,
  },
  text: {
    color: theme.palette.grey.white,
  },
});

interface IDialogButtonOkProps {
  label: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress: () => void;
}

export const DialogButtonOk = ({ label, disabled, style, textStyle, onPress }: IDialogButtonOkProps) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[styles.buttonContainer, style, disabled && styles.disabledOpacity]}>
    <Text style={[styles.text, textStyle]}>{label}</Text>
  </TouchableOpacity>
);
