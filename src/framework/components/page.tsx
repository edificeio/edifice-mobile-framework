/**
 * ODE Mobile UI - Page
 * All the page logic in a component syntax.
 *
 * Features :
 * - NavBar configuration
 * - Displays Connection tracker and notifier
 * - Handle keyboard
 */
import * as React from 'react';
import {
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
  SafeAreaView,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';

import styled from '@emotion/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useRoute } from '@react-navigation/native';

import { UI_SIZES } from './constants';
import SnowFlakes from './SnowFlakes';
import { StatusBar } from './status-bar';
import { ToastHandler } from './toast/component';

import theme from '~/app/theme';
import { isModalModeOnThisRoute } from '~/framework/navigation/hideTabBarAndroid';
import Notifier from '~/framework/util/notifier';
import DEPRECATED_ConnectionTrackingBar from '~/ui/ConnectionTrackingBar';

export interface PageViewProps extends ViewProps {
  gutters?: true | 'both' | 'vertical' | 'horizontal' | 'none';
  showNetworkBar?: boolean;
  statusBar?: 'primary' | 'light' | 'dark' | 'none';
  showToast?: boolean;
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
  backgroundColor: theme.ui.background.page,
  flex: 1,
});
export const PageView = (props: PageViewProps) => {
  const { children, gutters, showNetworkBar = true, showToast = true, statusBar, ...viewProps } = props;
  const route = useRoute();

  const gutterStyle = React.useMemo(
    () => ({
      flex: 1,
      ...getPageGutterStyle(gutters ?? 'none'),
    }),
    [gutters],
  );

  const statusBarComponent = React.useMemo(
    () => (statusBar !== 'none' ? <StatusBar type={statusBar ?? 'primary'} /> : null),
    [statusBar],
  );

  const isModal = isModalModeOnThisRoute(route.name);
  const page = (
    <PageViewStyle {...viewProps}>
      <>
        {statusBarComponent}
        {showNetworkBar ? <DEPRECATED_ConnectionTrackingBar /> : null}
        <Notifier id={route.name} />
        <View style={gutterStyle}>{children}</View>
        {isModal && showToast ? <ToastHandler /> : null}
        {isModal && <SnowFlakes />}
      </>
    </PageViewStyle>
  );

  return page;
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
    android: undefined,
    ios: 'padding',
  }) as KeyboardAvoidingViewProps['behavior'];
  const { children, gutters, ...pageProps } = props;
  const InnerViewComponent = props.scrollable ? ScrollView : View;
  const AreaComponent = (props.safeArea ?? true) ? SafeAreaView : View;
  const headerHeight = useHeaderHeight();
  return (
    <PageView gutters={gutters} {...pageProps}>
      <KeyboardAvoidingView
        behavior={keyboardAvoidingViewBehavior}
        keyboardVerticalOffset={headerHeight} // top inset height is included in headerHeight by React Navigation
        contentContainerStyle={styles.flexGrow1}
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
