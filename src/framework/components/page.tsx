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
  Keyboard,
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';

import styled from '@emotion/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useRoute } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UI_SIZES } from './constants';
import { ScreenView } from './screen';
import { ScreenViewProps } from './screen/types';
import { ANDROID_16 } from '../util/permissions';

import theme from '~/app/theme';
import Notifier from '~/framework/util/notifier';
import DEPRECATED_ConnectionTrackingBar from '~/ui/ConnectionTrackingBar';

export interface PageViewProps extends ViewProps {
  gutters?: true | 'both' | 'vertical' | 'horizontal' | 'none';
  showNetworkBar?: boolean;
  statusBar?: ScreenViewProps['statusBar'];
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
  const { children, gutters, showNetworkBar = true, statusBar, ...viewProps } = props;
  const route = useRoute();

  const gutterStyle = React.useMemo(
    () => ({
      flex: 1,
      ...getPageGutterStyle(gutters ?? 'none'),
    }),
    [gutters],
  );

  const page = (
    <PageViewStyle {...viewProps}>
      <>
        {showNetworkBar ? <DEPRECATED_ConnectionTrackingBar /> : null}
        <Notifier id={route.name} />
        <View style={gutterStyle}>{children}</View>
      </>
    </PageViewStyle>
  );

  return <ScreenView statusBar={statusBar}>{page}</ScreenView>;
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
  const [kbHeight, setKbHeight] = React.useState(0);
  React.useEffect(() => {
    const keyboardShowListener = Keyboard.addListener('keyboardDidShow', e => {
      if (Platform.OS !== 'android' || DeviceInfo.getApiLevelSync() < ANDROID_16) return;
      setKbHeight(e.endCoordinates.height);
    });

    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', e => {
      if (Platform.OS !== 'android' || DeviceInfo.getApiLevelSync() < ANDROID_16) return;
      setKbHeight(0);
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

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
        style={React.useMemo(() => [styles.flex1, { paddingBottom: kbHeight }], [kbHeight])}>
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
