import * as React from 'react';
import { ScrollView as RNScrollView, ScrollViewProps as RNScrollViewProps, View } from 'react-native';

import { UI_SIZES } from './constants';

export interface ScrollViewProps extends RNScrollViewProps {
  bottomInset?: boolean;
}

export default function ScrollView(props: ScrollViewProps) {
  const { bottomInset = true, contentContainerStyle, scrollIndicatorInsets, ...otherProps } = props;
  return (
    <RNScrollView
      {...otherProps}
      contentContainerStyle={
        bottomInset ? [{ paddingBottom: UI_SIZES.screen.bottomInset }, contentContainerStyle] : contentContainerStyle
      }
      scrollIndicatorInsets={scrollIndicatorInsets || { right: 0.001 }} // 🍎 Hack to guarantee the scrollbar sticks to the right edge of the screen.
    />
  );
}
