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
    trackColor={{ false: theme.palette.grey.fog, true: theme.palette.primary.regular }}
  />
);
