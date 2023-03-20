import * as React from 'react';

import CarouselScreen from '~/framework/components/carousel';
import { computeNavBar as CarouselNavBar } from '~/framework/components/carousel/screen';
import { computeNavBar as MediaPlayerNavBar } from '~/framework/components/media/player';
import MediaPlayer from '~/framework/components/media/player';
import { getTypedRootStack } from '~/framework/navigation/navigators';
import { BackdropPdfReaderScreen } from '~/framework/screens/PdfReaderScreen';

import { IModalsNavigationParams, ModalsRouteNames } from '.';

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
      <RootStack.Screen name={ModalsRouteNames.Carousel} options={CarouselNavBar} component={CarouselScreen} />
    </RootStack.Group>
    <RootStack.Group
      screenOptions={{
        presentation: 'fullScreenModal',
      }}>
      <RootStack.Screen name={ModalsRouteNames.MediaPlayer} options={MediaPlayerNavBar} component={MediaPlayer} />
    </RootStack.Group>
  </>
);
