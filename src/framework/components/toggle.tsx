import * as React from 'react';
import { Platform, Switch } from 'react-native';

import theme, { IShades } from '~/app/theme';

export interface IToggleProps {
  checked: boolean;
  onCheckChange: () => void;
  color: IShades;
  disabled?: boolean;
}

export const Toggle = ({ checked, color, disabled, onCheckChange }: IToggleProps) => {
  const trackColorOn = Platform.select({
    android: color[disabled ? 'light' : 'regular'],
    ios: color.regular,
  });
  return (
    <Switch
      value={checked}
      style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }], marginRight: -7 }}
      onValueChange={onCheckChange}
      trackColor={{ true: trackColorOn }}
      thumbColor={theme.palette.grey.white}
      disabled={disabled}
    />
  );
};
