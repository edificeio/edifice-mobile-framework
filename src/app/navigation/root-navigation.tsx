import * as React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { defaultScreenOptions, StackScreenLayout } from './layout';
import { MainNavigation, MainNavigationOptions } from './main-navigation';
import { NavigationRootParams } from './types';
import { ModuleNavigationParams } from '../module/types';

import authModule from '~/framework/modules/auth';
import { selectors } from '~/framework/modules/auth/redux/reducer';
import { useAvailableModules } from '../modules';
import modalScreens from '~/framework/navigation/modals/navigator';

// Note: import tabModules register to initialize it
// remove when all modules will be proted to new module system
import '~/framework/navigation/tabModules';
import { RootModule } from '../module';

export const RootStack = createNativeStackNavigator<NavigationRootParams>();

function renderMainNavigation() {
  return <RootStack.Screen options={MainNavigationOptions} name="tabs" component={MainNavigation} />;
}

type GuestStack = ReturnType<typeof createNativeStackNavigator<ModuleNavigationParams<typeof authModule>>>;

function renderGuestNavigation() {
  return <RootStack.Group>{authModule.renderScreens!(RootStack as GuestStack)}</RootStack.Group>;
}

export function RootNavigation() {
  const session = useSelector(selectors.session);
  const requirement = useSelector(selectors.requirement);
  const showAppContent = session && !requirement;
  const navigationKey = showAppContent ? session.logTimestamp.toString() : 'guest';

  // ToDo : screen tracking
  // ToDo : deep linking

  /**
   * @deprecated remove this when all modules are ported to the new module system
   */
  useAvailableModules(session);

  return (
    <RootStack.Navigator screenLayout={StackScreenLayout} screenOptions={defaultScreenOptions}>
      {/* Add the main screen of the app depending on authentication flow */}
      {showAppContent ? renderMainNavigation() : renderGuestNavigation()}

      {/**
       * Add modals that belongs to the framework here
       * navigationKey is useful here to get the user out of these screens if it is logged out in them
       * @see https://reactnavigation.org/docs/auth-flow/#removing-shared-screens-when-auth-state-changes
       */}
      <RootStack.Group navigationKey={navigationKey}>
        {RootModule.allRootModules.map(module =>
          module.renderScreens ? (
            <RootStack.Group key={module.name}>
              {module.renderScreens(RootStack as ReturnType<typeof createNativeStackNavigator>)}
            </RootStack.Group>
          ) : null,
        )}
        {modalScreens}
      </RootStack.Group>
    </RootStack.Navigator>
  );
}
