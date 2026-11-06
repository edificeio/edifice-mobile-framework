/**
 * Rights of the modules: which ones the session can use.
 */
import type { AuthActiveAccount } from '~/modules/auth/model';

import type { ConfigForRights } from './types';

/**
 * What `isModuleAvailableForUser` reads of a module: its rights, if it has any. A `CoreModule` has none, an `EntModule` may have some.
 * (`name` is only there so that any module can be given, a `CoreModule` too: it shares no property with the rights.)
 */
export type ModuleWithRights = { name: string } & ConfigForRights;

/**
 * Whether the user can use the module, by the rights of the session. Every condition the module declares must be met:
 * - `matchEntcoreApp`: an app of that name is in the rights of the session (`session.rights.apps`);
 * - `matchEntcoreWidget`: a widget of that name is in the rights of the session (`session.rights.widgets`);
 * - `hasRight`: it gives `true` for the session.
 * A module that declares none of them is always available: every `CoreModule`, and an `EntModule` without rights.
 */
export const isModuleAvailableForUser = (module: ModuleWithRights, session: AuthActiveAccount): boolean => {
  const { hasRight, matchEntcoreApp, matchEntcoreWidget } = module;
  if (matchEntcoreApp !== undefined && !session.rights.apps.some(app => app.name === matchEntcoreApp)) return false;
  if (matchEntcoreWidget !== undefined && !session.rights.widgets.some(widget => widget.name === matchEntcoreWidget)) return false;
  return hasRight?.(session) ?? true;
};
