/**
 * Open a module from anywhere in the tabs: « Mes applis », and later notifications, intents, deep links...
 */
import React from 'react';

import { CommonActions, TabActions, useNavigation } from '@react-navigation/native';

import { AllModulesArray, AllModulesWithEntryNames, useUserAvailableModules } from '~/app/module';

import { getTabScreenName } from './tabs';

/** The module of that name, if the session can use it and it has an `entry`. */
const findOpenableModule = (modules: AllModulesArray, name: string) =>
  modules.find(module => module.name === name && module.entry !== undefined);

/**
 * Tells whether a module can be opened with `useOpenModule`: it has an `entry` and the session can use it (`isModuleAvailableForUser`).
 * It narrows the name, so that it can then be given to `openModule`.
 * @returns `canOpenModule(name)`
 */
export const useCanOpenModule = () => {
  const modules = useUserAvailableModules();
  return React.useCallback(
    (name: string): name is AllModulesWithEntryNames => findOpenableModule(modules, name) !== undefined,
    [modules],
  );
};

/**
 * Opens a module on its `entry`:
 * - a module that has a tab: jumps to its tab (`JUMP_TO`), which shows the screen it is on (its `entry`, unless the user went further);
 * - another one: navigates to its `entry` in the current tab.
 * Only from a screen of the tabs: the tab navigator is one of its parents, that handle the action. Not from a modal.
 * @returns `openModule(name)`, which gives `false` and does nothing if the module can't be opened (see `useCanOpenModule`).
 */
export const useOpenModule = () => {
  const navigation = useNavigation();
  const modules = useUserAvailableModules();
  return React.useCallback(
    (name: AllModulesWithEntryNames): boolean => {
      const module = findOpenableModule(modules, name);
      if (module?.entry === undefined) return false;
      navigation.dispatch(
        module.tab !== undefined ? TabActions.jumpTo(getTabScreenName(module.name)) : CommonActions.navigate(module.entry),
      );
      return true;
    },
    [modules, navigation],
  );
};
