/**
 * Wrapper screens
 */

import React from 'react';
import { ActivityIndicator, Platform } from 'react-native';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NativeStackNavigatorProps } from '@react-navigation/native-stack';
import ErrorBoundary from 'react-native-error-boundary';

import theme from '~/app/theme';
import ErrorScreenView from '~/framework/components/screen/error';
import { ToastContainer } from '~/framework/components/toast';

import { IsModalProvider, modalPresentations } from './modal';
import { AndroidSheetGrabber, sheetPresentations } from './sheet';

export function BaseStackScreenLayout({
  children,
  options,
}: Parameters<NonNullable<NativeStackNavigatorProps['screenLayout']>>[0]) {
  // ToDo: Track error
  const isModal = options.presentation && modalPresentations.includes(options.presentation);
  const Wrapper = isModal ? BottomSheetModalProvider : React.Fragment;

  const isFormSheet = options.presentation && sheetPresentations.includes(options.presentation);

  return (
    <Wrapper>
      {
        /* Native Android formSheets does not have a grabber so were have to do it ourselves. */
        isFormSheet && Platform.OS === 'android' && options.sheetGrabberVisible && <AndroidSheetGrabber />
      }
      <IsModalProvider presentedAsModal={!!isModal}>
        <ErrorBoundary FallbackComponent={ErrorScreenView}>
          <React.Suspense fallback={<ActivityIndicator color={theme.palette.primary.regular} />}>{children}</React.Suspense>
        </ErrorBoundary>
      </IsModalProvider>
      {isModal && <ToastContainer />}
    </Wrapper>
  );
}
