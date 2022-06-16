import React from 'react';
import { StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { Text } from '~/framework/components/text';
import { layoutSize } from '~/styles/common/layoutSize';

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: theme.palette.secondary.regular,
    borderRadius: 2,
    marginLeft: layoutSize.LAYOUT_16,
    paddingHorizontal: layoutSize.LAYOUT_16,
    paddingVertical: layoutSize.LAYOUT_8,
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
