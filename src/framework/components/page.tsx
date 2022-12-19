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
import { useRoute } from '@react-navigation/native';
import * as React from 'react';
import {
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
import { connect } from 'react-redux';

import theme from '~/app/theme';
import Notifier from '~/framework/util/notifier';
import DEPRECATED_ConnectionTrackingBar from '~/ui/ConnectionTrackingBar';

import { UI_SIZES } from './constants';

export interface PageViewProps extends ViewProps {
  gutters?: true | 'both' | 'vertical' | 'horizontal' | 'none';
  showNetworkBar?: boolean;
  // xmasTheme?: boolean;
  statusBar?: 'primary' | 'light' | 'dark';
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
export const PageViewContainer = (props: PageViewProps) => {
  const { children, gutters, statusBar = 'primary', ...viewProps } = props;
  const route = useRoute();

  const gutterStyle = React.useMemo(
    () => ({
      flex: 1,
      ...getPageGutterStyle(gutters ?? 'none'),
    }),
    [gutters],
  );

  const statusBarComponent = React.useMemo(
    () =>
      Platform.select(
        statusBar === 'primary'
          ? {
              ios: <StatusBar barStyle="light-content" />,
              android: <StatusBar backgroundColor={theme.palette.primary.regular} barStyle="light-content" />,
            }
          : statusBar === 'light'
          ? {
              ios: <StatusBar barStyle="dark-content" />,
              android: <StatusBar backgroundColor={theme.ui.background.page} barStyle="dark-content" />,
            }
          : /* statusBar === 'dark' */ {
              ios: <StatusBar barStyle="light-content" />,
              android: <StatusBar backgroundColor={theme.palette.grey.black} barStyle="light-content" />,
            },
      ),
    [],
  );

  return (
    <PageViewStyle {...viewProps}>
      <>
        {statusBarComponent}
        <DEPRECATED_ConnectionTrackingBar />
        <Notifier id={route.name} />
        <View style={gutterStyle}>{children}</View>
      </>
    </PageViewStyle>
  );
};
export const PageView = connect((state: any) => {
  const ret = {
    // xmasTheme: state.user.xmas.xmasTheme,
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
