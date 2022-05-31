import * as React from 'react';
import { Switch } from 'react-native';

import theme from '~/app/theme';

export interface IToggleProps {
  checked: boolean;
  onCheckChange: () => void;
}

export const Toggle = ({ checked, onCheckChange }: IToggleProps) => (
  <Switch
    value={checked}
    onValueChange={() => onCheckChange && onCheckChange()}
    trackColor={{ false: theme.legacy.neutral.extraLight, true: theme.palette.primary.regular }}
  />
);
