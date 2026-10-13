import { NavigationProp, ParamListBase } from '@react-navigation/native';

import theme, { THEME_LEVEL } from '~/app/theme';
import homeModuleConfig from '~/framework/modules/home/module-config.ts';
import timelineModuleConfig from '~/framework/modules/timeline/module-config.ts';

import { computeTabRouteName } from './tabModules';

const getHomeModuleName = () => (theme.level === THEME_LEVEL.SECOND_DEGREE ? homeModuleConfig.name : timelineModuleConfig.name);

/**
 * route name of the home tab, notif handlers use it as the host tab of the screen they open,
 * since every module screen is registered in every tab stack.
 */
export const getHomeTabRouteName = () => computeTabRouteName(getHomeModuleName());

/**
 * Opens the home of the current theme(1D/2D).
 **/
export const navigateToHome = (navigation: NavigationProp<ParamListBase>, navParams?: object) =>
  navigation.navigate(getHomeTabRouteName(), {
    initial: true,
    params: navParams,
    screen: getHomeModuleName(),
  });
