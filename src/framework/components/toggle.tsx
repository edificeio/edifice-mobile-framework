import * as React from 'react';
import { Platform, StyleSheet, Switch } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from './constants';

export interface IToggleProps {
  checked: boolean;
  onCheckChange: () => void;
  disabled?: boolean;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.mediumPlus,
  },
});

export const Toggle = ({ checked, disabled, onCheckChange }: IToggleProps) => (
  <Switch
    style={Platform.select({ android: [styles.container, disabled && { backgroundColor: theme.palette.grey.fog }] })}
    value={checked}
    onValueChange={() => onCheckChange && onCheckChange()}
    trackColor={{ false: theme.palette.grey.fog, true: theme.palette.secondary.regular }}
    thumbColor={theme.palette.grey.white}
    disabled={disabled}
  />
);
