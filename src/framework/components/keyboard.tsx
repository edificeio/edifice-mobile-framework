import * as React from 'react';

import { useHeaderHeight } from '@react-navigation/elements';
import { KeyboardAvoidingViewProps, KeyboardAvoidingView as RNKeyboardAvoidingView } from 'react-native-keyboard-controller';

import { UI_STYLES } from './constants';

/**
 * Use this component instead React Native's one or react-native-keyboard-controller's one.
 * Note: automaticOffset does not work across different screens layouts, so custom keyboardVerticalOffset is already set on headerHeight.
 * You can use keyboardVerticalOffset prop to *add* more offset.
 * @param param0
 * @returns
 */
export const KeyboardAvoidingView = ({
  behavior = 'padding',
  children,
  contentContainerStyle: _contentContainerStyle,
  keyboardVerticalOffset: _keyboardVerticalOffset = 0,
  style: _style,
  ...props
}: Omit<KeyboardAvoidingViewProps, 'automaticOffset'>) => {
  const headerHeight = useHeaderHeight();
  const keyboardVerticalOffset = headerHeight;

  return (
    <RNKeyboardAvoidingView
      behavior={behavior}
      automaticOffset={false} // Note: automaticOffset does not work across different screens layouts, so don't use it and pass headerHeight instead.
      keyboardVerticalOffset={keyboardVerticalOffset + _keyboardVerticalOffset}
      contentContainerStyle={React.useMemo(() => [UI_STYLES.flexGrow1, _contentContainerStyle], [_contentContainerStyle])}
      style={React.useMemo(() => [UI_STYLES.flex1, _style], [_style])}
      {...props}>
      {children}
    </RNKeyboardAvoidingView>
  );
};
