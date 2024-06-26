import * as React from 'react';

import CarouselScreen from '~/framework/components/carousel';
import { computeNavBar as CarouselNavBar } from '~/framework/components/carousel/screen';
import FileImportScreen, { computeNavBar as FileAddNavBar } from '~/framework/components/inputs/rich-text/file-import';
import MediaPlayer from '~/framework/components/media/player';
import { computeNavBar as PDFNavBar, PDFReader } from '~/framework/components/pdf/pdf-reader';
import { setCrossIconBlackForRoutes, setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { getTypedRootStack } from '~/framework/navigation/navigators';

import { IModalsNavigationParams, ModalsRouteNames } from '.';

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
      <RootStack.Screen name={ModalsRouteNames.MediaPlayer} options={{ headerShown: false }} component={MediaPlayer} />
      <RootStack.Screen
        name={ModalsRouteNames.FileImport}
        options={FileAddNavBar}
        component={FileImportScreen}
        initialParams={{}}
      />
    </RootStack.Group>
  </>
);

setModalModeForRoutes([
  ModalsRouteNames.Pdf,
  ModalsRouteNames.Carousel,
  ModalsRouteNames.MediaPlayer,
  ModalsRouteNames.RichTextEditor,
  ModalsRouteNames.FileImport,
]);

setCrossIconBlackForRoutes([ModalsRouteNames.FileImport]);
