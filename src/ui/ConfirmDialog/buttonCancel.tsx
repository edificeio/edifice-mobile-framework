import React from 'react';
import { StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: theme.palette.grey.grey,
    borderRadius: UI_SIZES.radius.small,
    marginLeft: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.tiny,
    justifyContent: 'center',
    alignItems: 'center',
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

export const DialogButtonCancel = ({ style, textStyle, onPress }: IDialogButtonCancelProps) => (
  <TouchableOpacity style={[styles.buttonContainer, style]} onPress={onPress}>
    <SmallText style={[styles.text, textStyle]}>{I18n.get('Cancel')}</SmallText>
  </TouchableOpacity>
);
