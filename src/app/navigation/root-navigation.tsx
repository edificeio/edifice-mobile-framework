import * as React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { NavigationRootParams } from './types';

import CarouselScreen from '~/framework/components/carousel';
import { BodyText } from '~/framework/components/text';
import authModule from '~/framework/modules/auth';
import { selectors } from '~/framework/modules/auth/reducer';

const tabsScreenOptions = { headerShown: false };

export const RootStack = createNativeStackNavigator<NavigationRootParams>();

function renderMainNavigation() {
  return (
    <RootStack.Screen
      options={tabsScreenOptions}
      name="tabs"
      component={React.memo(() => (
        <BodyText>Tabs</BodyText>
      ))}
    />
  );
}

function renderGuestNavigation() {
  return <RootStack.Group>{authModule.renderScreens(RootStack)}</RootStack.Group>;
}

export function RootNavigation() {
  const session = useSelector(selectors.session);
  const requirement = useSelector(selectors.requirement);
  const showAppContent = session && !requirement;
  const navigationKey = showAppContent ? session.logTimestamp.toString() : 'guest';

  // ToDo : screen tracking
  // ToDo : deep linking

  return (
    <RootStack.Navigator>
      {/* Add the main screen of the app depending on authentication flow */}
      {showAppContent ? renderMainNavigation() : renderGuestNavigation()}

      {/**
       * Add modals that belongs to the framework here
       * navigationKey is useful here to get the user out of these screens if it is logged out in them
       * @see https://reactnavigation.org/docs/auth-flow/#removing-shared-screens-when-auth-state-changes
       */}
      <RootStack.Group navigationKey={navigationKey}>
        <RootStack.Screen name={'carousel'} component={CarouselScreen} />
      </RootStack.Group>
    </RootStack.Navigator>
  );
}
