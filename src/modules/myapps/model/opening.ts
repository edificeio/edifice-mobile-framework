/**
 * How an app opens.
 *
 * Two parts:
 * - `isConnector`: a fact of the server, computed when the app is received (rule inherited from `checkIfIsConnector`);
 * - `getAppOpeningStrategy`: it depends on the modules available for the user, so it is computed when read.
 */
import { AppModule, AppOpeningStrategy, EntApp } from '~/modules/myapps/model';

/**
 * Whether the address of an app can only be opened through `/auth/redirect`: it opens in a new window (`_blank`), or it is absolute
 * (`http(s)://`), or it has a route of a web app (`#/`), or the app has no prefix.
 */
export const isConnector = (app: { address: string; prefix?: string | null; target?: string | null }): boolean =>
  app.target === '_blank' || /^https?:\/\//.test(app.address) || app.address.includes('#/') || !app.prefix;

/** Address that opens a connector, signed in, through `/auth/redirect`. */
export const getConnectorUrl = (address: string): string => `/auth/redirect?url=${encodeURIComponent(address.trim())}`;

/**
 * @param module the module of the app, if one is available for the user.
 * - a module with an `entry` opens the app;
 * - a module without `entry`: the address of the app, as a web app, unless it is a connector;
 * - no module: the address of the app, as a connector.
 */
export const getAppOpeningStrategy = (
  app: Pick<EntApp, 'address' | 'isConnector'>,
  module: AppModule | undefined,
): AppOpeningStrategy => {
  if (module?.entry !== undefined) return { kind: 'module', moduleName: module.name };
  if (module !== undefined && !app.isConnector) return { kind: 'web', url: app.address };
  return { kind: 'connector', url: getConnectorUrl(app.address) };
};
