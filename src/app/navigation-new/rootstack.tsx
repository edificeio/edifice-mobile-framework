/**
 * Navigation Root Stack
 *
 * Top-level stack that includes modals + guest/requirement/tab navigation.
 *
 * What is shown depends on the auth stage (see `useAuthStage`):
 *  - `signedOut`   -> GuestScreens       : screens of core modules (sign-in is among them)
 *  - `requirement` -> RequirementScreens : the user is signed in but must fulfill a requirement (terms, password...) first
 *  - `signedIn`    -> UserScreens        : the tabs
 * Modals: those of core modules are available at every stage, those of ent modules only when signed in.
 * Core modals are declared once per stage, in a group of their own: when the stage changes, the group is replaced
 * (its key changes), which closes any modal that was open. A shared group without `if` would keep it open.
 * @see https://reactnavigation.org/docs/auth-flow#removing-shared-screens-when-auth-state-changes
 */
import React from 'react';

import { createNativeStackNavigator, NativeStackNavigatorProps } from '@react-navigation/native-stack';

import { useCoreModuleModals, useCoreModuleScreens, useModuleModals } from '~/app/module';
import requirementsModule from '~/modules/auth/requirements';
import { useAuthStage } from '~/modules/auth/store/accounts';

import { BaseStackScreenLayout } from './layout';
import { hiddenStackScreenOptions, rootStackOptions, visibleStackScreenOptions } from './options';
import { useTabNavigation } from './tabs';

type RootStackGroups = Record<
  string,
  {
    if?: () => boolean;
    screenOptions?: NativeStackNavigatorProps['screenOptions'];
    screens: object;
  }
>;

const useIsSignedOut = () => useAuthStage() === 'signedOut';
const useHasRequirement = () => useAuthStage() === 'requirement';
const useIsSignedIn = () => useAuthStage() === 'signedIn';

const GUEST_START_SCREEN: keyof ReturnType<typeof useCoreModuleScreens> = 'auth/load-account';

export const useRootStackNavigation = () => {
  const coreModals = useCoreModuleModals();
  const coreScreens = useCoreModuleScreens();
  const userModals = useModuleModals();
  const tabs = useTabNavigation();

  const guestScreens = React.useMemo(() => {
    // Start screen must be the first one in the object.
    // Destructuring here to restructure just after to make sure GUEST_START_SCREEN is a first place.
    const { [GUEST_START_SCREEN]: startScreen, ...restCoreScreens } = coreScreens;
    return { startScreen, ...restCoreScreens };
  }, [coreScreens]);

  const groups = React.useMemo(
    () =>
      ({
        GuestModals: {
          if: useIsSignedOut,
          screenOptions: visibleStackScreenOptions,
          screens: coreModals,
        },
        GuestScreens: {
          if: useIsSignedOut,
          screenOptions: { animationTypeForReplace: 'pop' },
          screens: guestScreens,
        },
        RequirementModals: {
          if: useHasRequirement,
          screenOptions: visibleStackScreenOptions,
          screens: { ...requirementsModule.modals, ...coreModals },
        },
        RequirementScreens: {
          if: useHasRequirement,
          screenOptions: visibleStackScreenOptions,
          screens: requirementsModule.screens,
        },
        UserModals: {
          if: useIsSignedIn,
          screenOptions: visibleStackScreenOptions,
          screens: { ...coreModals, ...userModals },
        },
        UserScreens: {
          if: useIsSignedIn,
          // Default animation to go on this screen is buggy and show artifacts in the corner of the screen.
          // 'simple_push' as a fallback use a rectangle container instead of rounded one, preventing the issue.
          // ToDo: check with react-navigation@8 or native-tabs if this fix is still necessary.
          screenOptions: { ...hiddenStackScreenOptions, animation: 'simple_push' },
          screens: { $tabs: tabs },
        },
      }) satisfies RootStackGroups,
    [coreModals, guestScreens, tabs, userModals],
  );

  // Order of groups does matter, even if they're declared as object !
  // `GuestScreens`, followed by `RequirementScreens`, need to be first, and with the starting screen a first place too. Modals come after the screens.
  const groupsOrder: (keyof typeof groups)[] = React.useMemo(
    () => ['GuestScreens', 'RequirementScreens', 'UserScreens', 'GuestModals', 'RequirementModals', 'UserModals'],
    [],
  );

  const Navigation = React.useMemo(
    () =>
      createNativeStackNavigator({
        groups: Object.fromEntries(groupsOrder.map(k => [k, groups[k]])),
        screenLayout: BaseStackScreenLayout,
        screenOptions: rootStackOptions,
      }),
    [groups, groupsOrder],
  );
  return Navigation;
};
