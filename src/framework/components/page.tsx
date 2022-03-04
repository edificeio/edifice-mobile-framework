/**
 * ODE Mobile UI - Page
 * All the page logic in a component syntax.
 *
 * Features :
 * - NavBar configuration
 * - Displays Connection tracker and notifier
 * - Handle keyboard
 */

import styled from '@emotion/native';
import * as React from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
  SafeAreaView,
  ScrollView,
  View,
  ViewProps,
} from 'react-native';
import { hasNotch } from 'react-native-device-info';
import { NavigationActions, NavigationInjectedProps } from 'react-navigation';

import theme from '~/app/theme';
import Notifier from '~/framework/util/notifier';
import DEPRECATED_ConnectionTrackingBar from '~/ui/ConnectionTrackingBar';
import { FakeHeader, FakeHeaderProps, HeaderBackAction } from './header';

export interface PageViewProps extends ViewProps {
  navigation: NavigationInjectedProps['navigation'];
  // Navbar setup.
  navBar?: FakeHeaderProps; // Forwared as FakeHeader props...
  navBarWithBack?: Omit<FakeHeaderProps, 'left'>; // Forwared as FakeHeader props...
  navBarNode?: React.ReactNode; // ... or rendered as-is.
  // Use multiple navBar for a super combo plus ultra !
  onBack?: () => boolean | void; // call when trigger a Back event. The given function returns true to perform the back action, false to cancel it.
  // Fixme : Currently not working for iOS swipe back.
}

export const PageView_Style = styled.View({
  flex: 1,
  backgroundColor: theme.color.background.page,
});
export const PageView = (props: PageViewProps) => {
  const { navigation, children, navBar, navBarWithBack, navBarNode, onBack, ...viewProps } = props;

  const goBack = () => {
    return onBack && onBack() && navigation.dispatch(NavigationActions.back()) || undefined;
  };

  // Handle Back Android
  React.useEffect(() => {
    if (onBack) {
      const callback = () => {
        goBack();
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', callback);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', callback);
      };
    }
  });

  return (
    <PageView_Style {...viewProps}>
      {navBar ? <FakeHeader {...navBar} /> : null}
      {navBarWithBack ? (
        <FakeHeader
          left={
            <HeaderBackAction
              navigation={navigation}
              {...(onBack
                ? {
                    onPress: goBack,
                  }
                : {})}
            />
          }
          {...navBarWithBack}
        />
      ) : null}
      {navBarNode ? navBarNode : null}
      <DEPRECATED_ConnectionTrackingBar />
      <Notifier id={navigation.state.routeName} />
      {children}
    </PageView_Style>
  );
};

export const KeyboardPageView = (
  props: React.PropsWithChildren<
    ViewProps & {
      navigation: NavigationInjectedProps['navigation'];
      scrollable?: boolean;
    }
  >,
) => {
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
