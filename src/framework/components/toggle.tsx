import * as React from 'react';
import { Platform, Switch } from 'react-native';

import theme from '~/app/theme';

export interface IToggleProps {
  checked: boolean;
  onCheckChange: () => void;
  disabled?: boolean;
}

export const Toggle = ({ checked, disabled, onCheckChange }: IToggleProps) => {
  const trackColorOn = Platform.select({
    android: theme.palette.secondary[disabled ? 'light' : 'regular'],
    ios: theme.palette.secondary.regular,
  });
  return (
    <Switch
      value={checked}
      onValueChange={() => onCheckChange && onCheckChange()}
      trackColor={{ true: trackColorOn }}
      thumbColor={theme.palette.grey.white}
      disabled={disabled}
    />
  );
};
