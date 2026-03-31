import * as React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { NavigationRootParams } from './types';

import CarouselScreen from '~/framework/components/carousel';
import { BodyText } from '~/framework/components/text';

const RootStack = createNativeStackNavigator<NavigationRootParams>();

const tabsScreenOptions = { headerShown: false };

export function RootNavigation() {
  return (
    <RootStack.Navigator initialRouteName="tabs">
      {/* Add the main screen of the app depending on authentication flow */}
      <RootStack.Screen
        options={tabsScreenOptions}
        name="tabs"
        component={React.memo(() => (
          <BodyText>Tabs</BodyText>
        ))}
      />

      {/* Add modals that belongs to the framework here */}
      <RootStack.Screen name={'carousel'} component={CarouselScreen} />
    </RootStack.Navigator>
  );
}
