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
import { FakeHeader, FakeHeaderProps } from './header';

export interface PageViewProps extends ViewProps {
  path?: string; // Path of the view as it is supplied by the navigator. Used as a key for showing Notifier.
  // Navbar setup.
  navBar?: FakeHeaderProps; // Forwared as FakeHeader props...
  navBarNode?: React.ReactNode; // ... or rendered as-is.
  // Use both for a super combo plus ultra !
}

const PageView_Style = styled.View({
  flex: 1,
  backgroundColor: theme.color.background.page,
});
export const PageView = (props: PageViewProps) => {
  const { path, children, navBar, navBarNode, ...viewProps } = props;
  return (
    <PageView_Style {...viewProps}>
      {navBar ? <FakeHeader {...navBar} /> : null}
      {navBarNode ? navBarNode : null}
      <DEPRECATED_ConnectionTrackingBar />
      {path ? <Notifier id={path} /> : null}
      {children}
    </PageView_Style>
  );
};

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
