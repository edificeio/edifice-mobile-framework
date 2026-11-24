/**
 * Entries of the modules (`entries` of their config): what other modules read of them.
 */
import type {
  AllModulesNames,
  AllModulesRecord,
  ConfigForResourceEntry,
  ConfigForRights,
  ConfigForUserMenuEntry,
  ModuleEntries,
  UserMenuSection,
} from './types';

/** A link of `entries.userMenu` of a module of the app, with the name of that module. */
export type UserMenuEntry = {
  [Name in AllModulesNames]: ModuleEntries<AllModulesRecord[Name]> extends { userMenu: readonly (infer Entry)[] }
    ? Entry & { module: Name }
    : never;
}[AllModulesNames];

/** What `getUserMenuEntries` reads of a module. */
type ModuleWithUserMenu = { name: string; entries: { userMenu?: readonly ConfigForUserMenuEntry<PropertyKey>[] } };

/**
 * The links that the modules add to a section of the home of `user` (`entries.userMenu`), with the name of their module.
 * Sorted by `order` (ascending), then those without one, in the order of the modules (and of their own list).
 * @param modules the modules available for the user.
 */
export const getUserMenuEntries = (modules: readonly ModuleWithUserMenu[], section: UserMenuSection): UserMenuEntry[] =>
  modules
    .flatMap(module => (module.entries.userMenu ?? []).map(entry => ({ ...entry, module: module.name })))
    .filter(entry => entry.section === section)
    // `sort` is stable: links with the same order keep the order of the modules
    .sort((a, b) => {
      if (a.order === b.order) return 0;
      if (a.order === undefined) return 1;
      if (b.order === undefined) return -1;
      return a.order - b.order;
    }) as UserMenuEntry[];

/** What `getResourceEntry` reads of a module. */
type ModuleWithResourceEntry = Pick<ConfigForRights, 'matchEntcoreApp'> & { entries: { resource?: ConfigForResourceEntry } };

/**
 * The entry that opens the resources of an app (`entries.resource`): the one of the module whose `matchEntcoreApp` is that app.
 * @param modules the modules available for the user.
 * @param appName the app of the resource (`ResourceMedia.appName`).
 */
export const getResourceEntry = (
  modules: readonly ModuleWithResourceEntry[],
  appName: string,
): ConfigForResourceEntry | undefined =>
  modules.find(module => module.matchEntcoreApp === appName && module.entries.resource !== undefined)?.entries.resource;
