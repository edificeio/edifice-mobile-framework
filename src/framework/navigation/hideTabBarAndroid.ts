/**
 * Workaround to hide tabBar on some screens on Android, because it currently does not implement native modals...
 *
 * How to :
 * use `hideAndroidTabBarOnTheseRoutes` in your module to populate the route map on which tabBar is hidden
 * use `getAndroidTabBarStyleForNavState` by giving navState to get the nav options to apply
 */
import { NavigationState } from '@react-navigation/native';
import { Platform } from 'react-native';

const routesWithTabBarHiddenOnAndroid: string[] = [];

export const hideAndroidTabBarOnTheseRoutes = (routeNames: string[]) => {
  routesWithTabBarHiddenOnAndroid.push(...routeNames);
};

export const isAndroidTabBarHiddenOnThisRoute = (routeName: string) => routesWithTabBarHiddenOnAndroid.includes(routeName);

export const getAndroidTabBarStyleForNavState = (navState: NavigationState) => {
  if (Platform.OS !== 'android') return undefined;
  const currentTab = navState.routes[navState.index];
  const currentScreen =
    currentTab?.state && currentTab.state.index !== undefined ? currentTab.state.routes[currentTab.state.index] : undefined;
  const hideTabBar = currentScreen?.name && isAndroidTabBarHiddenOnThisRoute(currentScreen?.name);
  return hideTabBar ? { display: 'none' as const } : undefined;
};
