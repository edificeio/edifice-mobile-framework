import * as React from 'react';

import theme from '~/app/theme';

import { Icon, IconProps, checkHasIcon } from './Icon';

export const IconOnOff = ({ focused = false, name, size = 22, ...props }: IconProps) => {
  const imageName = focused ? `${name}-on` : `${name}-off`;
  const color = focused ? theme.palette.primary.regular : theme.ui.text.light;
  return <Icon name={checkHasIcon(imageName) ? imageName : name} color={color} size={size} {...props} />;
};
