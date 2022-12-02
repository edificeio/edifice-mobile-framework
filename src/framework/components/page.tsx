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
  ScrollViewProps,
  StatusBar,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';
import { NavigationActions, NavigationInjectedProps } from 'react-navigation';

import theme from '~/app/theme';
import Notifier from '~/framework/util/notifier';
import DEPRECATED_ConnectionTrackingBar from '~/ui/ConnectionTrackingBar';

import { UI_SIZES } from './constants';
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
  gutters?: true | 'both' | 'vertical' | 'horizontal' | 'none';
  showNetworkBar?: boolean;
}

export const pageGutterSize = UI_SIZES.spacing.medium;
export const pageGutterStyleH = { paddingHorizontal: pageGutterSize };
export const pageGutterStyleV = { paddingVertical: pageGutterSize };

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  flexGrow1: { flexGrow: 1 },
});

export const getPageGutterStyle = (gutters: PageViewProps['gutters'] = true) => ({
  ...(gutters === 'both' || gutters === 'vertical' || gutters === true ? pageGutterStyleV : {}),
  ...(gutters === 'both' || gutters === 'horizontal' || gutters === true ? pageGutterStyleH : {}),
});

export const PageViewStyle = styled.View({
  flex: 1,
  backgroundColor: theme.ui.background.page,
});
export const PageView = (props: PageViewProps) => {
  const { navigation, children, navBar, navBarWithBack, navBarNode, showNetworkBar = true, onBack, gutters, ...viewProps } = props;
  const navBarColor = StyleSheet.flatten(navBar?.style || navBarWithBack?.style)?.backgroundColor;

  const goBack = () => {
    return (onBack && onBack() && navigation.dispatch(NavigationActions.back())) || undefined;
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

  const gutterStyle = React.useMemo(
    () => ({
      flex: 1,
      ...getPageGutterStyle(gutters ?? 'none'),
    }),
    [gutters],
  );

  return (
    <PageViewStyle {...viewProps}>
      <>
        <StatusBar barStyle="light-content" backgroundColor={navBarColor || theme.palette.primary.regular} />
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
        {showNetworkBar ? <DEPRECATED_ConnectionTrackingBar /> : null}
        <Notifier id={navigation.state.routeName} />
        <View style={gutterStyle}>{children}</View>
      </>
    </PageViewStyle>
  );
};

export const KeyboardPageView = (
  props: React.PropsWithChildren<
    PageViewProps & {
      scrollable?: boolean;
      safeArea?: boolean;
      scrollViewProps?: ScrollViewProps;
    }
  >,
) => {
  const keyboardAvoidingViewBehavior = Platform.select({
    ios: 'padding',
    android: undefined,
  }) as KeyboardAvoidingViewProps['behavior'];
  // BEWARE of adding keyboardVerticalOffset in the future when we'll get back the real React Navigation headers.
  const { children, gutters, ...pageProps } = props;
  const InnerViewComponent = props.scrollable ? ScrollView : View;
  const AreaComponent = props.safeArea ?? true ? SafeAreaView : View;
  return (
    <PageView gutters={gutters} {...pageProps}>
      <KeyboardAvoidingView
        behavior={keyboardAvoidingViewBehavior}
        keyboardVerticalOffset={UI_SIZES.elements.navbarHeight + UI_SIZES.screen.topInset}
        style={styles.flex1}>
        <InnerViewComponent
          style={styles.flex1}
          contentContainerStyle={styles.flexGrow1}
          alwaysBounceVertical={false}
          overScrollMode="never"
          keyboardShouldPersistTaps="handled"
          {...props.scrollViewProps}>
          <AreaComponent style={styles.flex1}>{children}</AreaComponent>
        </InnerViewComponent>
      </KeyboardAvoidingView>
    </PageView>
  );
};
