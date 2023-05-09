/**
 * Workaround to hide tabBar on some screens on Android, because it currently does not implement native modals...
 * + Workaround to show cross icon instead of back icon on Android & iOS.
 *
 * How to :
 * use `setModalModeForRoutes` in your module to populate the route map on which tabBar is hidden
 * use `isModalModeOnThisRoute` by giving navState to get the nav options to apply
 */
import { NavigationState } from '@react-navigation/native';
import { Platform } from 'react-native';

const routesWithTabBarHiddenOnAndroid: string[] = [];

export const setModalModeForRoutes = (routeNames: string[]) => {
  routesWithTabBarHiddenOnAndroid.push(...routeNames);
};

export const isModalModeOnThisRoute = (routeName: string) => routesWithTabBarHiddenOnAndroid.includes(routeName);

export const getAndroidTabBarStyleForNavState = (navState: NavigationState) => {
  const currentTab = navState.routes[navState.index];
  const currentScreen =
    currentTab?.state && currentTab.state.index !== undefined ? currentTab.state.routes[currentTab.state.index] : undefined;
  const hideTabBar = currentScreen?.name && isModalModeOnThisRoute(currentScreen?.name);
  if (Platform.OS !== 'android') return undefined;
  return hideTabBar ? { display: 'none' as const } : undefined;
};
