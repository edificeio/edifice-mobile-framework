import * as React from 'react';
import { ScrollView } from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { defaultTabOptions, TabScreenLayout } from './layout';

import { BodyText } from '~/framework/components/text';

const MainTabs = createBottomTabNavigator();

export function MainNavigation() {
  return (
    <MainTabs.Navigator screenLayout={TabScreenLayout} screenOptions={defaultTabOptions} detachInactiveScreens>
      <MainTabs.Screen
        name="tab1"
        component={React.memo(() => (
          <BodyText style={{ backgroundColor: 'cyan', padding: 32 }}>TAB 1</BodyText>
        ))}
      />
      <MainTabs.Screen
        name="tab2"
        component={React.memo(() => (
          <BodyText style={{ backgroundColor: 'cyan', padding: 32 }}>TAB 2</BodyText>
        ))}
      />
      <MainTabs.Screen
        name="tab3"
        component={React.memo(() => (
          <ScrollView>
            <BodyText style={{ backgroundColor: 'lime', marginTop: 800, padding: 32 }}>TAB 3</BodyText>
          </ScrollView>
        ))}
      />
      <MainTabs.Screen
        name="tab4"
        component={React.memo(() => (
          <BodyText style={{ backgroundColor: 'cyan', padding: 32 }}>TAB 4</BodyText>
        ))}
      />
    </MainTabs.Navigator>
  );
}
MainNavigation.options = { headerShown: false };
