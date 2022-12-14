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
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
  SafeAreaView,
  ScrollView,
  ScrollViewProps,
  StatusBar,
  StyleSheet,
  Vibration,
  View,
  ViewProps,
} from 'react-native';
import RNShake from 'react-native-shake';
import Snow from 'react-native-snow-bg';
import {
  NavigationActions,
  NavigationEventSubscription,
  NavigationFocusInjectedProps,
  NavigationInjectedProps,
  withNavigationFocus,
} from 'react-navigation';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import Notifier from '~/framework/util/notifier';
import DEPRECATED_ConnectionTrackingBar from '~/ui/ConnectionTrackingBar';

import { getUserSession } from '../util/session';
import SnowFlakes from './SnowFlakes';
import { UI_SIZES } from './constants';
import { FakeHeader, FakeHeaderProps, HeaderBackAction } from './header';

export interface PageViewProps extends ViewProps, NavigationFocusInjectedProps {
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
  xmasTheme?: boolean;
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
const PageViewContainer = (props: PageViewProps) => {
  const {
    navigation,
    children,
    navBar,
    navBarWithBack,
    navBarNode,
    showNetworkBar = true,
    onBack,
    gutters,
    xmasTheme,
    isFocused,
    ...viewProps
  } = props;
  // const [snowfall, setSnowfall] = React.useState(false);
  // const [fadeAnim, setFadeAnim] = React.useState(new Animated.Value(1));
  // let focusEventListener: NavigationEventSubscription;
  const navBarColor = StyleSheet.flatten(navBar?.style || navBarWithBack?.style)?.backgroundColor;

  const goBack = () => {
    return (onBack && onBack() && navigation.dispatch(NavigationActions.back())) || undefined;
  };

  // React.useEffect(() => {
  //   const isUserLoggedIn = getUserSession()?.user?.id;
  //   const stopSnowFall = () => {
  //     setSnowfall(false);
  //     setFadeAnim(new Animated.Value(1));
  //   };
  //   const makeSnowFall = () => {
  //     setSnowfall(true);
  //     Vibration.vibrate();
  //     const snowfallTimer = setTimeout(() => {
  //       Animated.timing(fadeAnim, {
  //         toValue: 0,
  //         duration: 1000,
  //         useNativeDriver: false,
  //       }).start(() => {
  //         stopSnowFall();
  //       });
  //     }, 20000);
  //     return () => clearTimeout(snowfallTimer);
  //   };

  //   // Specific screens
  //   if (navigation.state.routeName === 'Xmas') {
  //     if (xmasTheme) makeSnowFall();
  //     else stopSnowFall();
  //   } else if (navigation.state.routeName === 'timeline') {
  //     if (xmasTheme) makeSnowFall();
  //   }

  //   // Blur-screen listener
  //   focusEventListener = navigation.addListener('didBlur', () => {
  //     stopSnowFall();
  //   });

  //   // Device-shake listener
  //   const subscription = RNShake.addListener(() => {
  //     if (isUserLoggedIn && xmasTheme) makeSnowFall();
  //   });

  //   // Handle Back Android
  //   if (onBack) {
  //     const callback = () => {
  //       goBack();
  //       return true;
  //     };
  //     BackHandler.addEventListener('hardwareBackPress', callback);
  //     return () => {
  //       BackHandler.removeEventListener('hardwareBackPress', callback);
  //       focusEventListener.remove();
  //       subscription.remove();
  //     };
  //   } else {
  //     return () => {
  //       focusEventListener.remove();
  //       subscription.remove();
  //     };
  //   }
  // }, [xmasTheme]);

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
      <SnowFlakes navigation={navigation} isFocused={isFocused} />
      {/* {snowfall ? (
        <Animated.View style={{ position: 'absolute', opacity: fadeAnim }}>
          <Snow fullScreen snowflakesCount={150} fallSpeed="medium" />
        </Animated.View>
      ) : null} */}
    </PageViewStyle>
  );
};
export const PageView = connect((state: any) => {
  const ret = {
    xmasTheme: state.user.xmas.xmasTheme,
  };
  return ret;
})(withNavigationFocus(PageViewContainer));

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
