/**
 * How an app opens: by its module, if one of the app matches it and can be opened (`useCanOpenModule`); else its address, in the
 * browser (see `getAppUrl`).
 */
import type { AllModulesNames } from '~/app/module';

/** Whether the address is on the platform: without domain (`/actualites`), or of the same origin as the platform. */
const isPlatformAddress = (address: string, platformUrl: string): boolean => {
  if (address.startsWith('/')) return true;
  try {
    return new URL(address).origin === new URL(platformUrl).origin;
  } catch {
    return false;
  }
};

/**
 * Address that opens an app in the browser, signed in:
 * - an address of the platform: as it is (`openUrl` makes it absolute and signs it);
 * - another one (a connector): through `/auth/redirect`, which signs in the user on the target.
 * @param platformUrl the url of the platform of the session.
 */
export const getAppUrl = (address: string, platformUrl: string): string => {
  const trimmed = address.trim();
  return isPlatformAddress(trimmed, platformUrl) ? trimmed : `/auth/redirect?url=${encodeURIComponent(trimmed)}`;
};

/**
 * The module of each app (its name), by the name of the app: a module is the one of an app when its `matchEntcoreApp` is the name
 * of the app.
 * @param modules the modules available for the user.
 */
export const getAppModules = (
  modules: readonly { name: AllModulesNames; matchEntcoreApp?: string }[],
): ReadonlyMap<string, AllModulesNames> =>
  new Map(modules.flatMap(({ matchEntcoreApp, name }) => (matchEntcoreApp ? [[matchEntcoreApp, name] as const] : [])));
