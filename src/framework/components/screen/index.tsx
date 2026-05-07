import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useRoute } from '@react-navigation/native';

import { ToastContainer } from '~/framework/components/toast';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { assertSession } from '~/framework/modules/auth/redux/reducer';
import { isModalModeOnThisRoute } from '~/framework/navigation/hideTabBarAndroid';
import { Trackers } from '~/framework/util/tracker';

import ErrorScreenView, { withErrorBoundary } from './error';
import styles from './styles';
import { ScreenViewProps } from './types';

// ToDo manage keyboard

/**
 * @deprecated no need screenView anymore
 */
export const ScreenView = withErrorBoundary(
  function ({ children }: PropsWithChildren<ScreenViewProps>) {
    const route = useRoute();
    const isModal = isModalModeOnThisRoute(route.name);

    const content = (
      <>
        <View style={styles.defaultScreenStyle}>{children}</View>
      </>
    );

    return isModal ? (
      <BottomSheetModalProvider>
        {content}
        <ToastContainer />
      </BottomSheetModalProvider>
    ) : (
      content
    );
  },
  {
    FallbackComponent: function (props) {
      return <ErrorScreenView {...props} />;
    },
    onError: (error, _stackTrace) => {
      Trackers.recordCrashError(error, 'ScreenView');
    },
  },
);

/**
 * use `withSession` instead
 * @param WrappedComponent
 * @returns
 */
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
