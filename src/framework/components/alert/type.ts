import React from 'react';
import { Text, ViewStyle } from 'react-native';

import theme from '~/app/theme';

export interface AlertCardProps extends React.PropsWithChildren {
  type: keyof typeof theme.palette.status;
  icon?: boolean | React.ReactElement;
  text?: string | React.ReactElement<typeof Text>;
  style?: ViewStyle;
}
