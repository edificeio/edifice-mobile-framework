/**
 * Open a module from anywhere in the tabs: « Mes applis », and later notifications, intents, deep links...
 */
import React from 'react';

import { CommonActions, TabActions, useNavigation } from '@react-navigation/native';

import { AllModulesWithMyAppsEntryNames, getModuleByName, isModuleAvailableForUser, useModulesRecord } from '~/app/module';
import { useSession } from '~/modules/auth/store/accounts';

import { getTabScreenName } from '../navigators/tabs';

/** Gives the module of a name (in O(1)), if it has an entry in « Mes applis » (`entries.myApps`) and the user can use it (`isModuleAvailableForUser`). */
const useFindOpenableModule = () => {
  const record = useModulesRecord();
  const session = useSession();
  return React.useCallback(
    (name: string) => {
      const module = getModuleByName(record, name);
      return module?.entries.myApps !== undefined && session !== undefined && isModuleAvailableForUser(module, session)
        ? module
        : undefined;
    },
    [record, session],
  );
};

/**
 * Tells whether a module can be opened with `useOpenModule`: it has `entries.myApps` and the session can use it (`isModuleAvailableForUser`).
 * It narrows the name, so that it can then be given to `openModule`.
 * @returns `canOpenModule(name)`
 */
export const useCanOpenModule = () => {
  const findOpenableModule = useFindOpenableModule();
  return React.useCallback(
    (name: string): name is AllModulesWithMyAppsEntryNames => findOpenableModule(name) !== undefined,
    [findOpenableModule],
  );
};

/**
 * Opens a module:
 * - a module that has a tab (`entries.tab`): jumps to its tab (`JUMP_TO`), which shows the screen it is on (the route of its tab,
 *   unless the user went further);
 * - another one: navigates to the route of `entries.myApps` in the current tab.
 * Only from a screen of the tabs: the tab navigator is one of its parents, that handle the action. Not from a modal.
 * @returns `openModule(name)`, which gives `false` and does nothing if the module can't be opened (see `useCanOpenModule`).
 */
export const useOpenModule = () => {
  const navigation = useNavigation();
  const findOpenableModule = useFindOpenableModule();
  return React.useCallback(
    (name: AllModulesWithMyAppsEntryNames): boolean => {
      const module = findOpenableModule(name);
      if (module?.entries.myApps === undefined) return false;
      navigation.dispatch(
        module.entries.tab !== undefined
          ? TabActions.jumpTo(getTabScreenName(module.name))
          : CommonActions.navigate(module.entries.myApps.route),
      );
      return true;
    },
    [findOpenableModule, navigation],
  );
};
