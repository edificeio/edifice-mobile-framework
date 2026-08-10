import theme, { THEME_LEVEL } from '~/app/theme';

import { computeTabRouteName } from './tabModules';

const getHomeModuleName = () => (theme.level === THEME_LEVEL.SECOND_DEGREE ? 'home' : 'timeline');

/**
 * route name of the home tab, notif handlers use it as the host tab of the screen they open,
 * since every module screen is registered in every tab stack.
 */
export const getHomeTabRouteName = () => computeTabRouteName(getHomeModuleName());

export const getHomeTarget = () => ({ screen: getHomeModuleName(), tab: getHomeTabRouteName() });
