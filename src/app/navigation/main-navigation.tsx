import * as React from 'react';
import { View } from 'react-native';

import { BottomTabNavigationOptions, BottomTabNavigatorProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { EntModule, EntTabModule } from '~/app/module';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture, PictureProps, Svg } from '~/framework/components/picture';
import { CaptionBoldText, CaptionText } from '~/framework/components/text';
import { selectors } from '~/framework/modules/auth/redux/reducer';
import { getTabModuleDisplayName, selectAggregatedApps } from '~/framework/modules/myapps/reducer';
import { ModuleScreens } from '~/framework/navigation/moduleScreens';
import { tabModules } from '~/framework/navigation/tabModules';
import Feedback from '~/framework/util/feedback/feedback';
import { AnyNavigableModuleConfig } from '~/framework/util/moduleTool';

import { defaultTabOptions, hasActiveTabHighlight, styles as layoutStyles, tabBarIconSize, TabScreenLayout } from './layout';
import { createLeafStackNavigator } from './leaf-stack';
import { renderCoreModulesScreens } from './root-navigation';
import { AllModulesNavigationParams } from './types';
import { useConfirmChangeTab } from './use-confirm-remove';

const MainTabs = createBottomTabNavigator();
const LeafStack = createLeafStackNavigator<AllModulesNavigationParams>();

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
        tabBarIcon: ({ color, focused }) => <TabIcon module={m} focused={focused} size={tabBarIconSize} color={color} />,
        tabBarLabel: ({ color, focused }) => {
          const LabelText = hasActiveTabHighlight && focused ? CaptionBoldText : CaptionText;
          return (
            // negative marginHorizontal is necessary to prevent text wrapping
            <LabelText numberOfLines={1} ellipsizeMode="middle" style={{ color, marginHorizontal: -UI_SIZES.spacing.minor }}>
              {getTabModuleDisplayName(m, aggregatedApps)}
            </LabelText>
          );
        },
      })),

    [rightsMemoValue],
  );

  const tabModulesScreens = React.useMemo(
    () =>
      availableTabModules.map(tabModule => {
        return () => (
          <LeafStack.Navigator key={tabModule.name} initialRouteName={tabModule.tab.route}>
            {
              // New Modules screens here
              availableModules.map(module => (
                <LeafStack.Group key={module.name}>
                  {module.renderScreens ? module.renderScreens(LeafStack as ReturnType<typeof createNativeStackNavigator>) : null}
                </LeafStack.Group>
              ))
            }
            {
              // Old modules screens here
              ModuleScreens.all
            }
            {
              // Root modules replica here
              renderCoreModulesScreens(LeafStack)
            }
          </LeafStack.Navigator>
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
          <LeafStack.Navigator key={tabModule.config.name} initialRouteName={tabModule.config.routeName}>
            {
              // New Modules screens here
              availableModules.map(module => (
                <LeafStack.Group key={module.name}>
                  {module.renderScreens ? module.renderScreens(LeafStack as ReturnType<typeof createNativeStackNavigator>) : null}
                </LeafStack.Group>
              ))
            }
            {
              // Old modules screens here
              ModuleScreens.all
            }
            {
              // Root modules replica here
              renderCoreModulesScreens(LeafStack)
            }
          </LeafStack.Navigator>
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
      tabBarLabel: ({ color, focused }) => {
        const LabelText = hasActiveTabHighlight && focused ? CaptionBoldText : CaptionText;
        return (
          // negative marginHorizontal is necessary to prevent text wrapping
          <LabelText numberOfLines={1} ellipsizeMode="middle" style={{ color, marginHorizontal: -UI_SIZES.spacing.minor }}>
            {getTabModuleDisplayName(m.config, aggregatedApps)}
          </LabelText>
        );
      },
    }));
  }, [rightsMemoValue]);

  const confirmChangeTabListeners = useConfirmChangeTab();
  const tabListeners: NonNullable<BottomTabNavigatorProps['screenListeners']> = props => ({
    ...confirmChangeTabListeners(props),
    tabPress: event => {
      Feedback.tabPressed();
      confirmChangeTabListeners(props).tabPress?.(event);
    },
  });

  return React.useMemo(
    () => (
      <MainTabs.Navigator
        screenLayout={TabScreenLayout}
        screenOptions={defaultTabOptions}
        detachInactiveScreens
        screenListeners={tabListeners}>
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

/**
 * Wraps a tab icon to give the active one its rounded background.
 * Themes that declare no highlight render the icon as it is,
 * without the extra container.
 */
function TabIconWrapper({ children, focused }: React.PropsWithChildren<{ focused: boolean }>) {
  const style = React.useMemo(() => [layoutStyles.tabIcon, focused && layoutStyles.activeTabIcon], [focused]);

  if (!hasActiveTabHighlight) return <>{children}</>;
  return <View style={style}>{children}</View>;
}

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
  return (
    <TabIconWrapper focused={focused}>
      <Svg width={size} height={size} name={focused ? module.tab.iconActive : module.tab.iconInactive} fill={color} />
    </TabIconWrapper>
  );
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
  props.size = tabBarIconSize;
  if (dp.type === 'Image') {
    dp.style = [dp.style, { height: props.size, width: props.size }];
  } else if (dp.type === 'Icon') {
    dp.size = dp.size ?? props.size;
    dp.color = dp.color ?? props.color;
    dp.name = dp.name ?? 'more_vert';
    dp.style = [dp.style, layoutStyles.tabIconFont];
  } else if (dp.type === 'Svg') {
    dp.name = dp.name ?? 'ui-options';
    dp.height = props.size;
    dp.width = props.size;
    dp.fill = props.color;
  }
  if (props.focused) {
    dp = { ...dp, ...moduleConfig.displayPictureFocus, fill: props.color } as Partial<PictureProps>;
  }
  return (
    <TabIconWrapper focused={props.focused}>
      <Picture {...dp} />
    </TabIconWrapper>
  );
};
