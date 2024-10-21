import * as React from 'react';
import { Platform, StatusBar as RNStatusBar } from 'react-native';

import theme from '~/app/theme';

export interface StatusBarProps {
  type: 'primary' | 'light' | 'dark';
}

export const StatusBar = (props: StatusBarProps) => {
  return Platform.select(
    props.type === 'primary'
      ? {
          android: <RNStatusBar backgroundColor={theme.palette.primary.regular} barStyle="light-content" />,
          ios: <RNStatusBar barStyle="light-content" />,
        }
      : props.type === 'light'
        ? {
            android: <RNStatusBar backgroundColor={theme.ui.background.page} barStyle="dark-content" />,
            ios: <RNStatusBar barStyle="dark-content" />,
          }
        : /* props.type === 'dark' */ {
            android: <RNStatusBar backgroundColor={theme.palette.grey.black} barStyle="light-content" />,
            ios: <RNStatusBar barStyle="light-content" />,
          },
  );
};

export default StatusBar;
