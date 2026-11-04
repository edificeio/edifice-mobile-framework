/**
 * Signed requests of a module, typed with its scopes: an opt-in for the modules whose APIs are under their scopes.
 *
 * The OAuth2 token only gives access to the scopes that the modules declare (`scope` of `CoreModule` / `EntModule`). A scope is most
 * often the first segment of the paths it covers: `timeline` covers `/timeline/...`. `getModuleTransport('name')` gives the signed
 * functions of the transport (fetch functions, API consumers), typed so that they only accept such paths for the scopes of the module:
 * a request the token of the module can't make doesn't compile.
 *
 *     const { accountFetch } = getModuleTransport('myapps'); // scope: ['portal', 'userbook']
 *     accountFetch.json(account, '/userbook/preference/apps'); // OK
 *     accountFetch.json(account, '/timeline/lastNotifications'); // Error: `timeline` is not a scope of `myapps`
 *
 * Types only: the functions are those of the transport, unchanged (same behavior, same cost), and the name of the module is not
 * read. The scopes come from the type of the module (`AllModulesRecord`): they are declared only once, in its `index.ts`.
 *
 * Out of its reach, use the functions of the transport directly:
 * - the APIs whose path doesn't start with their scope (`/api/me/applications`, under `portal`): there is no rule to type them;
 * - the absolute URLs: their host is known only at runtime;
 * - the `Request` and `URL` objects, and the paths built in a variable typed `string` (write them inline, or `as const`).
 */
import type { ApiClientOptions, BaseApiClient } from '@edifice.io/community-client-rest-rn';

import type { AllModulesNames, AllModulesRecord, ModuleScope } from '~/app/module';

import { accountApi, sessionApi } from './api';
import { accountFetch, sessionFetch, tokenFetch } from './fetch';

/** A path of the platform under one of the scopes: `/timeline`, `/timeline/...` or `/timeline?...`. */
export type ScopedPath<Scope extends string> = `/${Scope}` | `/${Scope}/${string}` | `/${Scope}?${string}`;

/** A fetch function of the transport (`accountFetch`...): its own arguments (`Args`), then a path under the scopes. */
interface ScopedFetch<Args extends unknown[], Scope extends string> {
  (...args: [...Args, input: ScopedPath<Scope>, init?: RequestInit]): Promise<Response>;
  text: (...args: [...Args, input: ScopedPath<Scope>, init?: RequestInit]) => Promise<string>;
  json: <ReturnType>(...args: [...Args, input: ScopedPath<Scope>, init?: RequestInit]) => Promise<ReturnType>;
}

/** An API consumer is given `platform/apiName` as its base: `apiName` is then a scope, or a path under one (`collect/api`). */
interface ScopedApiConfig<Scope extends string> {
  apiName: Scope | `${Scope}/${string}`;
}

type ApiClientClass<Client extends BaseApiClient> = new (_options?: ApiClientOptions) => Client;

/** The signed functions of the transport (fetch functions, API consumers), for a module whose scopes are `Scope`. */
export interface ModuleTransport<Scope extends string> {
  accountFetch: ScopedFetch<[account: Parameters<typeof accountFetch>[0]], Scope>;
  sessionFetch: ScopedFetch<[], Scope>;
  tokenFetch: ScopedFetch<[tokens: Parameters<typeof tokenFetch>[0]], Scope>;
  accountApi: <Client extends BaseApiClient>(
    account: Parameters<typeof accountApi>[0],
    moduleConfig: ScopedApiConfig<Scope>,
    client: ApiClientClass<Client>,
  ) => Client;
  sessionApi: <Client extends BaseApiClient>(moduleConfig: ScopedApiConfig<Scope>, client: ApiClientClass<Client>) => Client;
}

const moduleTransport = { accountApi, accountFetch, sessionApi, sessionFetch, tokenFetch };

/** The signed functions of the transport, typed with the scopes of the module `name` (see above). */
export const getModuleTransport: <Name extends AllModulesNames>(
  name: Name,
) => ModuleTransport<ModuleScope<AllModulesRecord[Name]>> = () => moduleTransport;
