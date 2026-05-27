import * as React from 'react';
import { Platform } from 'react-native';

import { useHeaderHeight } from '@react-navigation/elements';
import { useRoute } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { KeyboardAvoidingViewProps, KeyboardAvoidingView as RNKeyboardAvoidingView } from 'react-native-keyboard-controller';

import { UI_STYLES } from './constants';
import { isModalModeOnThisRoute } from '../navigation/hideTabBarAndroid';
import { ANDROID_15 } from '../util/permissions';

export const KeyboardAvoidingView = ({
  automaticOffset = true,
  behavior = 'padding',
  children,
  contentContainerStyle: _contentContainerStyle,
  keyboardVerticalOffset: _keyboardVerticalOffset = 0,
  style: _style,
  ...props
}: KeyboardAvoidingViewProps) => {
  const headerHeight = useHeaderHeight();
  const route = useRoute();
  const isModal = isModalModeOnThisRoute(route.name);
  const keyboardVerticalOffset = Platform.select({
    android: DeviceInfo.getApiLevelSync() > ANDROID_15 || isModal ? 0 : headerHeight,
    default: 0,
  });

  return (
    <RNKeyboardAvoidingView
      behavior={behavior}
      automaticOffset={automaticOffset}
      keyboardVerticalOffset={keyboardVerticalOffset + _keyboardVerticalOffset}
      contentContainerStyle={React.useMemo(() => [UI_STYLES.flexGrow1, _contentContainerStyle], [_contentContainerStyle])}
      style={React.useMemo(() => [UI_STYLES.flex1, _style], [_style])}
      {...props}>
      {children}
    </RNKeyboardAvoidingView>
  );
};
