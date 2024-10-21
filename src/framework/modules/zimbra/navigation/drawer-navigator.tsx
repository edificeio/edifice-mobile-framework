import * as React from 'react';

import { createDrawerNavigator } from '@react-navigation/drawer';

import { zimbraRouteNames } from '.';

import DrawerContent from '~/framework/modules/zimbra/components/DrawerContent';
import { SystemFolder } from '~/framework/modules/zimbra/model';
import ZimbraMailListScreen, { computeNavBar as mailListNavBar } from '~/framework/modules/zimbra/screens/mail-list';

export default () => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator drawerContent={props => <DrawerContent {...props} />} screenOptions={{ drawerType: 'front' }}>
      <Drawer.Screen
        name={zimbraRouteNames.mailList}
        component={ZimbraMailListScreen}
        options={mailListNavBar}
        initialParams={{ folderName: SystemFolder.INBOX, folderPath: '/Inbox', isTrashed: false }}
      />
    </Drawer.Navigator>
  );
};
