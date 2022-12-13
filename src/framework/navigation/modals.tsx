/**
 * Modals screens available globally
 */
import { ParamListBase } from '@react-navigation/native';
import * as React from 'react';

import { BackdropPdfReaderScreen } from '~/framework/screens/PdfReaderScreen';
import { getTypedRootStack } from './navigators';

export enum ModalsRouteNames {
  Pdf = '$pdf',
}

export interface IModalsNavigationParams extends ParamListBase {
  [ModalsRouteNames.Pdf]: { title: string; src: string };
}

const RootStack = getTypedRootStack<IModalsNavigationParams>()
export default (
  <RootStack.Group screenOptions={{ presentation: 'formSheet', headerShown: true }}>
    <RootStack.Screen
      name={ModalsRouteNames.Pdf}
      options={screenProps => ({ title: screenProps.route.params.title })}
      component={BackdropPdfReaderScreen}
    />
  </RootStack.Group>
);
