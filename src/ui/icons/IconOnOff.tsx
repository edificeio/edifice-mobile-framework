import * as React from 'react';

import { Icon, IconProps, checkHasIcon } from './Icon';
import { CommonStyles } from '~/styles/common/styles';
import theme from '~/app/theme';

export const IconOnOff = ({ focused = false, name, size = 22, ...props }: IconProps) => {
  const imageName = focused ? `${name}-on` : `${name}-off`;
  const color = focused ? theme.color.secondary.regular : CommonStyles.iconColorOff;
  return <Icon name={checkHasIcon(imageName) ? imageName : name} color={color} size={size} {...props} />;
};
