import * as React from 'react';

import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { UI_SIZES } from '~/framework/components/constants';
import { Picture, PictureProps, Svg } from '~/framework/components/picture';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { withSession } from '~/framework/modules/auth/util';
import { ModuleScreens } from '~/framework/navigation/moduleScreens';
import { tabModules } from '~/framework/navigation/tabModules';
import { AnyNavigableModuleConfig } from '~/framework/util/moduleTool';

import { AllModulesNavigationParams } from './types';
import { EntModule } from '../module';
import { defaultScreenOptions, defaultTabOptions, StackScreenLayout, TabScreenLayout } from './layout';
import { EntTabModule } from '../module/types';

const MainTabs = createBottomTabNavigator();

export const MainNavigation = withSession(
  React.memo(function MainNavigation({ session: session }: { session: AuthActiveAccount }) {
    // ToDo: dependency narrowing over apps and not whole session

    const availableModules = React.useMemo(() => EntModule.getAvailableForAccount(session), [session]);

    const availableTabModules = React.useMemo(() => EntModule.filterTabModules(availableModules), [availableModules]);

    const tabModulesOptions = React.useMemo(
      () =>
        availableTabModules.map<BottomTabNavigationOptions>(m => ({
          tabBarButtonTestID: m.tab.testId,
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
              initialRouteName={tabModule.tab.route}>
              {
                // New Modules screens here
                availableModules.map(module => (
                  <TabStack.Group key={module.name}>
                    {module.renderScreens ? module.renderScreens(TabStack as ReturnType<typeof createNativeStackNavigator>) : null}
                  </TabStack.Group>
                ))
              }
              {
                // Old modules screens here
                ModuleScreens.all
              }
            </TabStack.Navigator>
          );
        }),
      [availableModules, availableTabModules],
    );

    /**
     * @deprecated remove when every module is ported to new module system.
     */
    const oldTabModules = React.useMemo(() => {
      return tabModules
        .get()
        .filterAvailables(session)
        .sort((a, b) => a.config.displayOrder - b.config.displayOrder);
    }, [session]);

    /**
     * @deprecated remove when every module is ported to new module system.
     */
    const oldTabModulesScreens = React.useMemo(() => {
      return oldTabModules.map(tabModule => {
        const TabStack = createNativeStackNavigator();
        return () => (
          <TabStack.Navigator
            key={tabModule.config.name}
            screenLayout={StackScreenLayout}
            screenOptions={defaultScreenOptions}
            initialRouteName={tabModule.config.routeName}>
            {
              // New Modules screens here
              availableModules.map(module => (
                <TabStack.Group key={module.name}>
                  {module.renderScreens ? module.renderScreens(TabStack as ReturnType<typeof createNativeStackNavigator>) : null}
                </TabStack.Group>
              ))
            }
            {
              // Old modules screens here
              ModuleScreens.all
            }
          </TabStack.Navigator>
        );
      });
    }, []);

    /**
     * @deprecated remove when every module is ported to new module system.
     */
    const oldTabModulesOptions = React.useMemo(() => {
      return oldTabModules.map<BottomTabNavigationOptions>(m => ({
        tabBarButtonTestID: m.config.testID,
        tabBarIcon: props => createOldTabIcon(m.config, props),
        tabBarLabel: m.config.tabDisplayName,
      }));
    }, [session]);

    return (
      <MainTabs.Navigator screenLayout={TabScreenLayout} screenOptions={defaultTabOptions} detachInactiveScreens>
        {
          // New Modules tabs here
          availableTabModules.map((tabModule, index) => {
            return (
              <MainTabs.Screen
                component={tabModulesScreens[index]}
                options={tabModulesOptions[index]}
                key={`tab-${tabModule.name}`}
                name={`tab-${tabModule.name}`}
              />
            );
          })
        }
        {
          // Old Modules tabs here
          oldTabModules.map((tabModule, index) => {
            return (
              <MainTabs.Screen
                component={oldTabModulesScreens[index]}
                options={oldTabModulesOptions[index]}
                key={`tab-${tabModule.config.name}`}
                name={`tab-${tabModule.config.name}`}
              />
            );
          })
        }
      </MainTabs.Navigator>
    );
  }),
);
export const MainNavigationOptions: NativeStackNavigationOptions = { headerShown: false };

function TabIcon({
  color,
  focused,
  module,
  size,
}: {
  module: EntTabModule<string>;
  focused: boolean;
  color: string;
  size: number;
}) {
  return <Svg width={size} height={size} name={focused ? module.tab.iconActive : module.tab.iconInactive} fill={color} />;
}

/**
 * @deprecated remove when all modules are ported to new module system
 * @param moduleConfig
 * @param props
 * @returns
 */
const createOldTabIcon = (
  moduleConfig: AnyNavigableModuleConfig,
  props: Parameters<Required<BottomTabNavigationOptions>['tabBarIcon']>[0],
) => {
  let dp: Partial<PictureProps> = { ...moduleConfig.displayPictureBlur };
  props.size = UI_SIZES.elements.tabbarIconSize;
  if (dp.type === 'Image') {
    dp.style = [dp.style, { height: props.size, width: props.size }];
  } else if (dp.type === 'Icon') {
    dp.size = dp.size ?? props.size;
    dp.color = dp.color ?? props.color;
    dp.name = dp.name ?? 'more_vert';
  } else if (dp.type === 'Svg') {
    dp.name = dp.name ?? 'ui-options';
    dp.height = props.size;
    dp.width = props.size;
    dp.fill = props.color;
  }
  if (props.focused) {
    dp = { ...dp, ...moduleConfig.displayPictureFocus, fill: props.color } as Partial<PictureProps>;
  }
  return <Picture {...dp} />;
};
