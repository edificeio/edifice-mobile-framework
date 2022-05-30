import * as React from 'react';

import theme from '~/app/theme';
import { CommonStyles } from '~/styles/common/styles';

import { Icon, IconProps, checkHasIcon } from './Icon';

export const IconOnOff = ({ focused = false, name, size = 22, ...props }: IconProps) => {
  const imageName = focused ? `${name}-on` : `${name}-off`;
  const color = focused ? theme.palette.primary.regular : CommonStyles.iconColorOff;
  return <Icon name={checkHasIcon(imageName) ? imageName : name} color={color} size={size} {...props} />;
};
