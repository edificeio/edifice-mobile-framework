import React from 'react';
import { StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    backgroundColor: theme.palette.secondary.regular,
    borderRadius: UI_SIZES.radius.small,
    justifyContent: 'center',
    marginLeft: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  disabledOpacity: {
    opacity: 0.5,
  },
  text: {
    color: theme.ui.text.inverse,
  },
});

interface IDialogButtonOkProps {
  label: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress: () => void;
}

export const DialogButtonOk = ({ disabled, label, onPress, style, textStyle }: IDialogButtonOkProps) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[styles.buttonContainer, style, disabled && styles.disabledOpacity]}>
    <SmallText style={[styles.text, textStyle]}>{label}</SmallText>
  </TouchableOpacity>
);
