/**
 * Tab Stack
 *
 * Each tab contain a Stack that display every screen (non-modal) of every module.
 * This allow, for example, to mount a Blog screen in the Home tab when needed.
 *
 * This has the drawback that tab does not switch automatically when `navigate` is called to another module.
 * If you need to switch tab, navigate to the tab itself using `getTabScreenName` in a JUMP_TO action.
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AllModulesStaticScreens } from '~/app/module';

/**
 * Gather all static tabs from modules.
 * @returns
 */
export const createTabStackNavigation = (screens: AllModulesStaticScreens, initialRouteName: keyof AllModulesStaticScreens) => {
  return createNativeStackNavigator({
    initialRouteName,
    screens,
  });
};
