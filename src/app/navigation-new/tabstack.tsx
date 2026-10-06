/**
 * Tab Stack
 *
 * Each tab contain a Stack that display every screen (non-modal) of every module.
 * This allow, for example, to mount a Blog screen in the Home tab when needed.
 *
 * This has the drawback that tab does not switch automatically when `navigate` is called to another module.
 * If you need to switch tab, navigate to the tab itself using `getTabScreenName` in a JUMP_TO action.
 */

import React from 'react';

import { useIsFocused } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SharedTransitionBoundary } from 'react-native-reanimated';

import { AllModulesStaticScreens } from '~/app/module';

/**
 * Gather all static tabs from modules.
 * @returns
 */
export const createTabStackNavigation = (screens: AllModulesStaticScreens, initialRouteName: keyof AllModulesStaticScreens) => {
  return createNativeStackNavigator({
    initialRouteName,
    screenLayout: ({ children }) => <TransitionBoundary>{children}</TransitionBoundary>,
    screens,
  });
};

function TransitionBoundary({ children }: React.PropsWithChildren) {
  const isFocused = useIsFocused();
  return <SharedTransitionBoundary isActive={isFocused}>{children}</SharedTransitionBoundary>;
}
