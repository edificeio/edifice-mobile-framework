import * as React from 'react';

import CarouselScreen from '~/framework/components/carousel';
import { computeNavBar as CarouselNavBar } from '~/framework/components/carousel/screen';
import MediaPlayer, { computeNavBar as MediaPlayerNavBar } from '~/framework/components/media/player';
import { getTypedRootStack } from '~/framework/navigation/navigators';
import { BackdropPdfReaderScreen, computeNavBar as noticeNavBar } from '~/framework/screens/PdfReaderScreen';

import { IModalsNavigationParams, ModalsRouteNames } from '.';
import { hideAndroidTabBarOnTheseRoutes } from '../hideTabBarAndroid';

const RootStack = getTypedRootStack<IModalsNavigationParams>();
export default (
  <>
    <RootStack.Group screenOptions={{ presentation: 'modal' }}>
      <RootStack.Screen name={ModalsRouteNames.Pdf} options={noticeNavBar} component={BackdropPdfReaderScreen} />
    </RootStack.Group>
    <RootStack.Group
      screenOptions={{
        presentation: 'fullScreenModal',
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

hideAndroidTabBarOnTheseRoutes([ModalsRouteNames.Pdf, ModalsRouteNames.Carousel, ModalsRouteNames.MediaPlayer]);
