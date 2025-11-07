import * as React from 'react';
import { Platform, StatusBar as RNStatusBar } from 'react-native';

import theme from '~/app/theme';

export interface StatusBarProps {
  type: 'primary' | 'light' | 'white' | 'dark';
}

const statusBarConfig = {
  dark: {
    backgroundColor: theme.palette.grey.black,
    barStyle: 'light-content' as const,
    translucent: false,
  },
  light: {
    backgroundColor: theme.ui.background.page,
    barStyle: 'dark-content' as const,
    translucent: false,
  },
  primary: {
    backgroundColor: theme.palette.primary.regular,
    barStyle: 'light-content' as const,
    translucent: false,
  },
  white: {
    backgroundColor: theme.palette.grey.white,
    barStyle: 'dark-content' as const,
    translucent: false,
  },
};

export const StatusBar = ({ type }: StatusBarProps) => {
  const { backgroundColor, barStyle, translucent } = statusBarConfig[type];

  return (
    <RNStatusBar
      translucent={translucent}
      backgroundColor={Platform.OS === 'android' ? backgroundColor : undefined}
      barStyle={barStyle}
    />
  );
};

export default StatusBar;
