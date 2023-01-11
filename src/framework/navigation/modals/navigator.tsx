import * as React from 'react';

import CarouselScreen from '~/framework/components/carousel';
import { computeNavBar } from '~/framework/components/carousel/screen';
import { BackdropPdfReaderScreen } from '~/framework/screens/PdfReaderScreen';

import { IModalsNavigationParams, ModalsRouteNames } from '.';
import { getTypedRootStack } from '../navigators';

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
