import * as React from 'react';

import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { defaultScreenOptions, defaultTabOptions, StackScreenLayout, TabScreenLayout } from './layout';
import { Module } from '../module';
import { AllModulesNavigationParams } from './types';

import { Svg } from '~/framework/components/picture';
import { BodyBoldText } from '~/framework/components/text';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { withSession } from '~/framework/modules/auth/util';
import { TabModule } from '../module/types';

const MainTabs = createBottomTabNavigator();

function TabIcon({ color, focused, module, size }: { module: TabModule<string>; focused: boolean; color: string; size: number }) {
  return <Svg width={size} height={size} name={focused ? module.tab.tabIconActive : module.tab.tabIconInactive} fill={color} />;
}

export const MainNavigation = withSession(
  React.memo(function MainNavigation({ session: _session }: { session: AuthActiveAccount }) {
    // ToDo: dependency narrowing over apps and not whole session

    const availableModules = React.useMemo(() => Module.getAvailableModules(_session), [_session]);
    const availableTabModules = React.useMemo(() => Module.filterTabModules(availableModules), [availableModules]);

    const tabModulesOptions = React.useMemo(
      () =>
        availableTabModules.map<BottomTabNavigationOptions>(m => ({
          tabBarButtonTestID: m.tab.tabTestID,
          tabBarIcon: ({ color, focused, size }) => <TabIcon module={m} focused={focused} size={size} color={color} />,
          tabBarLabel: m.name,
        })),
      [availableTabModules],
    );

    const tabModulesScreens = React.useMemo(
      () =>
        availableTabModules.map(tabModule => {
          const TabStack = createNativeStackNavigator<AllModulesNavigationParams>();
          return () => (
            <TabStack.Navigator
              key={tabModule.name}
              screenLayout={StackScreenLayout}
              screenOptions={defaultScreenOptions}
              initialRouteName={tabModule.tab.tabRoute}>
              {availableModules.map(module => (
                <TabStack.Group key={module.name}>
                  {module.renderScreens ? module.renderScreens(TabStack as ReturnType<typeof createNativeStackNavigator>) : null}
                </TabStack.Group>
              ))}
            </TabStack.Navigator>
          );
        }),
      [availableModules, availableTabModules],
    );

    return (
      <MainTabs.Navigator screenLayout={TabScreenLayout} screenOptions={defaultTabOptions} detachInactiveScreens>
        {availableTabModules.map((tabModule, index) => {
          return (
            <MainTabs.Screen
              component={tabModulesScreens[index]}
              options={tabModulesOptions[index]}
              key={`tab-${tabModule.name}`}
              name={`tab-${tabModule.name}`}
            />
          );
        })}
        <MainTabs.Screen
          component={() => <BodyBoldText>Messagerie</BodyBoldText>}
          options={{
            tabBarIcon: ({ color, focused, size }) => (
              <Svg width={size} height={size} name={focused ? 'ui-rafterDown' : 'ui-rafterUp'} fill={color} />
            ),
            tabBarLabel: 'Messagerie',
          }}
          name="Messagerie"
        />
        <MainTabs.Screen
          component={() => <BodyBoldText>Communautés</BodyBoldText>}
          options={{
            tabBarIcon: ({ color, focused, size }) => (
              <Svg width={size} height={size} name={focused ? 'ui-rafterDown' : 'ui-rafterUp'} fill={color} />
            ),
            tabBarLabel: 'Communautés',
          }}
          name="Communautés"
        />
        <MainTabs.Screen
          component={() => <BodyBoldText>Mes Applis</BodyBoldText>}
          options={{
            tabBarIcon: ({ color, focused, size }) => (
              <Svg width={size} height={size} name={focused ? 'ui-rafterDown' : 'ui-rafterUp'} fill={color} />
            ),
            tabBarLabel: 'Mes Applis',
          }}
          name="Mes Applis"
        />
      </MainTabs.Navigator>
    );
  }),
);
export const MainNavigationOptions = { headerShown: false };
