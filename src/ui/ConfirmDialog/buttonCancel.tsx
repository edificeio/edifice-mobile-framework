import React from 'react';
import { StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.grey,
    borderRadius: UI_SIZES.radius.small,
    justifyContent: 'center',
    marginLeft: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  text: {
    color: theme.ui.text.inverse,
  },
});

interface IDialogButtonCancelProps {
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress: () => void;
}

export const DialogButtonCancel = ({ onPress, style, textStyle }: IDialogButtonCancelProps) => (
  <TouchableOpacity style={[styles.buttonContainer, style]} onPress={onPress}>
    <SmallText style={[styles.text, textStyle]}>{I18n.get('common-cancel')}</SmallText>
  </TouchableOpacity>
);
