import I18n from 'i18n-js';
import React from 'react';
import { StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Text } from '~/framework/components/text';

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 2,
    backgroundColor: theme.palette.grey.grey,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: theme.palette.grey.white,
  },
});

interface IDialogButtonCancelProps {
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress: () => void;
}

export const DialogButtonCancel = ({ style, textStyle, onPress }: IDialogButtonCancelProps) => (
  <TouchableOpacity style={[styles.buttonContainer, style]} onPress={onPress}>
    <Text style={[styles.text, textStyle]}>{I18n.t('Cancel')}</Text>
  </TouchableOpacity>
);
