/**
 * Modals screens available globally
 */
import { ParamListBase } from '@react-navigation/native';
import * as React from 'react';

import { BackdropPdfReaderScreen } from '~/framework/screens/PdfReaderScreen';

import CarouselScreen from '../components/carousel';
import { computeNavBar } from '../components/carousel/screen';
import { IMedia } from '../util/media';
import { navBarOptions } from './navBar';
import { getTypedRootStack } from './navigators';

export enum ModalsRouteNames {
  Pdf = '$pdf',
  Carousel = '$carousel',
}

export interface IModalsNavigationParams extends ParamListBase {
  [ModalsRouteNames.Pdf]: { title: string; src: string };
  [ModalsRouteNames.Carousel]: {
    data: IMedia[];
    startIndex?: number;
  };
}

const RootStack = getTypedRootStack<IModalsNavigationParams>();
export default (
  <>
    <RootStack.Group screenOptions={{ presentation: 'modal', headerShown: true }}>
      <RootStack.Screen
        name={ModalsRouteNames.Pdf}
        options={screenProps => ({ title: screenProps.route.params.title })}
        component={BackdropPdfReaderScreen}
      />
    </RootStack.Group>
    <RootStack.Group
      screenOptions={{
        presentation: 'fullScreenModal',
        headerShown: true,
      }}>
      <RootStack.Screen name={ModalsRouteNames.Carousel} options={computeNavBar} component={CarouselScreen} />
    </RootStack.Group>
  </>
);
