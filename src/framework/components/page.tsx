/**
 * ODE Mobile UI - Page
 * Build Page components in a reusable way.
 */

import styled from '@emotion/native';
import * as React from 'react';
import { KeyboardAvoidingView, KeyboardAvoidingViewProps, Platform, SafeAreaView, ScrollView, View, ViewProps } from 'react-native';
import { hasNotch } from 'react-native-device-info';

import theme from '~/app/theme';
import Notifier from '~/framework/util/notifier';
import DEPRECATED_ConnectionTrackingBar from '~/ui/ConnectionTrackingBar';

const PageView_StyleComponent = styled.View({
  flex: 1,
  backgroundColor: theme.color.background.page,
});

export const PageView = (props: React.PropsWithChildren<ViewProps & { path?: string }>) => (
  <PageView_StyleComponent>
    <DEPRECATED_ConnectionTrackingBar />
    {props.path ? <Notifier id={props.path} /> : null}
    {props.children}
  </PageView_StyleComponent>
);

export const KeyboardPageView = (props: React.PropsWithChildren<ViewProps & { path?: string; scrollable?: boolean }>) => {
  const keyboardAvoidingViewBehavior = Platform.select({
    ios: 'padding',
    android: undefined,
  }) as KeyboardAvoidingViewProps['behavior'];
  // const insets = useSafeAreaInsets();                            // Note : this commented code is the theory
  // const keyboardAvoidingViewVerticalOffset = insets.top + 56;    // But Practice >> Theory. Here, magic values ont the next ligne give better results.
  const keyboardAvoidingViewVerticalOffset = hasNotch() ? 100 : 76; // Those are "magic" values found by try&error. Seems to be fine on every phone.
  const { children, ...pageProps } = props;
  const InnerViewComponent = props.scrollable ? ScrollView : View;
  return (
    <PageView {...pageProps}>
      <KeyboardAvoidingView
        behavior={keyboardAvoidingViewBehavior}
        keyboardVerticalOffset={keyboardAvoidingViewVerticalOffset}
        style={{ height: '100%' }}>
        <InnerViewComponent contentContainerStyle={{ flexGrow: 1 }} alwaysBounceVertical={false} keyboardShouldPersistTaps="never">
          <SafeAreaView style={{ flexGrow: 1 }}>{children}</SafeAreaView>
        </InnerViewComponent>
      </KeyboardAvoidingView>
    </PageView>
  );
};
