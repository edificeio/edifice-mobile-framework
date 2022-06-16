import I18n from 'i18n-js';
import React from 'react';
import { StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { Text } from '~/framework/components/text';
import { layoutSize } from '~/styles/common/layoutSize';

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 2,
    backgroundColor: theme.palette.grey.grey,
    paddingHorizontal: layoutSize.LAYOUT_16,
    paddingVertical: layoutSize.LAYOUT_8,
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
