import * as React from 'react';

import FileImportScreen, { computeNavBar as FileAddNavBar } from '~/framework/components/inputs/rich-text/file-import';
import { computeNavBar as PDFNavBar, PDFReader } from '~/framework/components/pdf/pdf-reader';
import { infosNavBar, InfosScreen, logNavBar, LogScreen, networkNavBar, NetworkScreen } from '~/framework/modules/debug';
import AttachmentsImportScreen, {
  computeNavBar as AttachmentsImportAddNavBar,
} from '~/framework/modules/mails/components/attachments/modal-import';
import SplashadsScreen, { computeNavBar as SplashadsNavBar } from '~/framework/modules/splashads/screen';
import { setCrossIconBlackForRoutes, setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { getTypedRootStack } from '~/framework/navigation/navigators';

import { IModalsNavigationParams, ModalsRouteNames } from '.';

const RootStack = getTypedRootStack<IModalsNavigationParams>();
export default (
  <>
    <RootStack.Screen
      name={ModalsRouteNames.AttachmentsImport}
      options={AttachmentsImportAddNavBar}
      component={AttachmentsImportScreen}
      initialParams={{}}
    />
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
      <RootStack.Screen
        name={ModalsRouteNames.FileImport}
        options={FileAddNavBar}
        component={FileImportScreen}
        initialParams={{}}
      />
      <RootStack.Screen name={ModalsRouteNames.Infos} options={infosNavBar} component={InfosScreen} />
      <RootStack.Screen name={ModalsRouteNames.Log} options={logNavBar} component={LogScreen} />
      <RootStack.Screen name={ModalsRouteNames.Network} options={networkNavBar} component={NetworkScreen} />
      <RootStack.Screen
        name={ModalsRouteNames.SplashAds}
        options={SplashadsNavBar}
        component={SplashadsScreen}
        initialParams={{}}
      />
    </RootStack.Group>
  </>
);

setModalModeForRoutes([
  ModalsRouteNames.AttachmentsImport,
  ModalsRouteNames.FileImport,
  ModalsRouteNames.Infos,
  ModalsRouteNames.Log,
  ModalsRouteNames.Network,
  ModalsRouteNames.Pdf,
  ModalsRouteNames.RichTextEditor,
  ModalsRouteNames.SplashAds,
]);

setCrossIconBlackForRoutes([ModalsRouteNames.AttachmentsImport, ModalsRouteNames.FileImport, ModalsRouteNames.SplashAds]);
