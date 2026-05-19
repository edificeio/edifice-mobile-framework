import * as React from 'react';

import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { EntModule, EntTabModule } from '~/app/module';
import { Picture, PictureProps, Svg } from '~/framework/components/picture';
import { CaptionText } from '~/framework/components/text';
import { selectors } from '~/framework/modules/auth/redux/reducer';
import { getTabModuleDisplayName, selectAggregatedApps } from '~/framework/modules/myapps/reducer';
import { ModuleScreens } from '~/framework/navigation/moduleScreens';
import { tabModules } from '~/framework/navigation/tabModules';
import { AnyNavigableModuleConfig } from '~/framework/util/moduleTool';

import { defaultScreenOptions, defaultTabOptions, getTabBarIconSize, StackScreenLayout, TabScreenLayout } from './layout';
import { renderCoreModulesScreens } from './root-navigation';
import { AllModulesNavigationParams } from './types';

const MainTabs = createBottomTabNavigator();
const TabStack = createNativeStackNavigator<AllModulesNavigationParams>();

export const MainNavigation = React.memo(function MainNavigation() {
  /**
   * IMPORTANT NOTE
   *
   * Due to a react-navigation bug, if MainNavigation re-renders while a native modal is open, screens desynchronises from navigation state,
   * leaving the app in a undefined state and tab stack not responding to navigation events.
   *
   * We cannot fix this issue ourselves, thus we enforce MainNaviagtion (and RootNavigation) to be re-rendered only if stringified data is changed.
   * Since apps rights are determined by `aggregatedApps` AND `session`, we MUST compte a stable value that determines if rights have changed or not.
   * This value is called `rightsMemoValue` and serves a memo dependency for everything in the component.
   */

  // ToDo: dependency narrowing over apps and not whole session

  const session = useSelector(selectors.session);
  const aggregatedApps = useSelector(selectAggregatedApps);
  const availableModules = React.useMemo(() => (session ? EntModule.getAvailableForAccount(session) : []), [session]);
  const availableTabModules = React.useMemo(() => EntModule.filterTabModules(availableModules), [availableModules]);
  const rightsMemoValue = React.useMemo(
    () => availableModules.map(module => module.name).toString() + Object.keys(aggregatedApps).join(''),
    [aggregatedApps, availableModules],
  );

  const tabModulesOptions = React.useMemo(
    () =>
      availableTabModules.map<BottomTabNavigationOptions>(m => ({
        tabBarButtonTestID: m.tab.testId,
        tabBarIcon: ({ color, focused, size }) => (
          <TabIcon module={m} focused={focused} size={getTabBarIconSize(size)} color={color} />
        ),
        tabBarLabel: ({ color }) => <CaptionText style={{ color }}>{getTabModuleDisplayName(m, aggregatedApps)}</CaptionText>,
      })),

    [rightsMemoValue],
  );

  const tabModulesScreens = React.useMemo(
    () =>
      availableTabModules.map(tabModule => {
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
            {
              // Root modules replica here
              renderCoreModulesScreens(TabStack)
            }
          </TabStack.Navigator>
        );
      }),
    [rightsMemoValue],
  );

  /**
   * @deprecated remove when every module is ported to new module system.
   */
  const oldTabModules = React.useMemo(() => {
    return session
      ? tabModules
          .get()
          .filterAvailables(session)
          .sort((a, b) => a.config.displayOrder - b.config.displayOrder)
      : [];
  }, [rightsMemoValue]);

  /**
   * @deprecated remove when every module is ported to new module system.
   */
  const oldTabModulesScreens = React.useMemo(
    () =>
      oldTabModules.map(tabModule => {
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
            {
              // Root modules replica here
              renderCoreModulesScreens(TabStack)
            }
          </TabStack.Navigator>
        );
      }),
    [rightsMemoValue],
  );

  /**
   * @deprecated remove when every module is ported to new module system.
   */
  const oldTabModulesOptions = React.useMemo(() => {
    return oldTabModules.map<BottomTabNavigationOptions>(m => ({
      tabBarButtonTestID: m.config.testID,
      tabBarIcon: props => createOldTabIcon(m.config, props),
      tabBarLabel: ({ color }) => <CaptionText style={{ color }}>{getTabModuleDisplayName(m.config, aggregatedApps)}</CaptionText>,
    }));
  }, [rightsMemoValue]);

  return React.useMemo(
    () => (
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
    ),
    [rightsMemoValue],
  );
});
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
  props.size = getTabBarIconSize(props.size);
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
