import * as React from 'react';

import CarouselScreen from '~/framework/components/carousel';
import { computeNavBar as CarouselNavBar } from '~/framework/components/carousel/screen';
import MediaPlayer, { computeLoadingNavBar as MediaPlayerNavBar } from '~/framework/components/media/player';
import { computeNavBar as PDFNavBar, PDFReader } from '~/framework/components/pdf/pdf-reader';
import { getTypedRootStack } from '~/framework/navigation/navigators';

import { IModalsNavigationParams, ModalsRouteNames } from '.';
import { setModalModeForRoutes } from '../hideTabBarAndroid';

const RootStack = getTypedRootStack<IModalsNavigationParams>();
export default (
  <>
    <RootStack.Group
      screenOptions={{
        presentation: 'modal',
      }}>
      <RootStack.Screen name={ModalsRouteNames.Pdf} options={PDFNavBar} component={PDFReader} initialParams={{ title: '' }} />
    </RootStack.Group>
    <RootStack.Group
      screenOptions={{
        presentation: 'fullScreenModal',
      }}>
      <RootStack.Screen name={ModalsRouteNames.Carousel} options={CarouselNavBar} component={CarouselScreen} />
    </RootStack.Group>
    <RootStack.Group
      screenOptions={{
        // We must use these options instead of a regular modal, because on this screen the `headerShown` option is dynamic.
        // This is a limitation of React Navigation v6.
        animation: 'slide_from_bottom',
        fullScreenGestureEnabled: true,
        customAnimationOnGesture: true,
        gestureDirection: 'vertical',
        // presentation: 'fullScreenModal',
      }}>
      <RootStack.Screen name={ModalsRouteNames.MediaPlayer} options={MediaPlayerNavBar} component={MediaPlayer} />
    </RootStack.Group>
  </>
);

setModalModeForRoutes([ModalsRouteNames.Pdf, ModalsRouteNames.Carousel, ModalsRouteNames.MediaPlayer]);
