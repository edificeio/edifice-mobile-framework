/**
 * Wrapper screens
 */

import React from 'react';
import { ActivityIndicator } from 'react-native';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NativeStackNavigatorProps } from '@react-navigation/native-stack';
import ErrorBoundary from 'react-native-error-boundary';
import { StackPresentationTypes } from 'react-native-screens';

import theme from '~/app/theme';
import ErrorScreenView from '~/framework/components/screen/error';
import { ToastContainer } from '~/framework/components/toast';

const modalPresentations: (StackPresentationTypes | 'card')[] = [
  'containedModal',
  'containedTransparentModal',
  'formSheet',
  'fullScreenModal',
  'modal',
  'pageSheet',
  'transparentModal',
];

export function BaseStackScreenLayout({
  children,
  options,
}: Parameters<NonNullable<NativeStackNavigatorProps['screenLayout']>>[0]) {
  // ToDo: Track error
  const isModal = options.presentation && modalPresentations.includes(options.presentation);
  const Wrapper = isModal ? BottomSheetModalProvider : React.Fragment;

  return (
    <Wrapper>
      <ErrorBoundary FallbackComponent={ErrorScreenView}>
        <React.Suspense fallback={<ActivityIndicator color={theme.palette.primary.regular} />}>{children}</React.Suspense>
      </ErrorBoundary>
      {isModal && <ToastContainer />}
    </Wrapper>
  );
}
