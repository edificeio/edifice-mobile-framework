import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useRoute } from '@react-navigation/native';

import ErrorScreenView, { withErrorBoundary } from './error';
import styles from './styles';
import { ScreenViewProps } from './types';

import StatusBar from '~/framework/components/status-bar';
import { ToastHandler } from '~/framework/components/toast';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { assertSession } from '~/framework/modules/auth/reducer';
import { isModalModeOnThisRoute } from '~/framework/navigation/hideTabBarAndroid';
import { Trackers } from '~/framework/util/tracker';

// ToDo manage keyboard

export const ScreenView = withErrorBoundary(
  function (props: PropsWithChildren<ScreenViewProps>) {
    const route = useRoute();
    const isModal = isModalModeOnThisRoute(route.name);

    const content = (
      <>
        {<StatusBar type={props.statusBar ?? 'primary'} />}
        <View style={styles.defaultScreenStyle}>{props.children}</View>
      </>
    );

    return isModal ? (
      <BottomSheetModalProvider>
        {content}
        <ToastHandler />
      </BottomSheetModalProvider>
    ) : (
      content
    );
  },
  {
    FallbackComponent: function (props) {
      return <ErrorScreenView {...props} />;
    },
    onError: (error, stackTrace) => {
      Trackers.recordCrashError(error, 'ScreenView');
    },
  },
);

export const sessionScreen = function <Props extends object>(
  WrappedComponent: React.ComponentType<Props & { session: AuthActiveAccount }>,
) {
  return withErrorBoundary(
    function (screenProps: Props) {
      const session = assertSession();
      return (
        <ScreenView>
          <WrappedComponent {...screenProps} session={session} />
        </ScreenView>
      );
    },
    {
      FallbackComponent: function (errorProps) {
        return (
          <ScreenView>
            <ErrorScreenView {...errorProps} />
          </ScreenView>
        );
      },
    },
  );
};
