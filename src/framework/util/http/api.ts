/**
 * API Consumer for Edifice TS client
 */

import type { ApiClientOptions, BaseApiClient } from '@edifice.io/community-client-rest-rn/clients/base-api.client';

import appConf from '../appConf';
import { IUnkownModuleConfig } from '../moduleTool';
import { FetchError, FetchErrorCode } from './error';

import http from '.';

import { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';

export function api<Client extends BaseApiClient>(
  moduleConfig: Pick<IUnkownModuleConfig, 'apiName'>,
  account: AuthActiveAccount | AuthSavedLoggedInAccount,
  client: new (_options?: ApiClientOptions) => Client,
) {
  const platform = appConf.getExpandedPlatform(account.platform);
  if (!platform) throw new FetchError(FetchErrorCode.NOT_LOGGED);
  return new client({
    baseUrl: platform.url + '/' + moduleConfig.apiName,
    fetchImpl: (input: Parameters<typeof fetch>[0], init: Parameters<typeof fetch>[1]) =>
      http.fetchForAccount(account, input, init),
  });
}

export function sessionApi<Client extends BaseApiClient>(
  moduleConfig: Pick<IUnkownModuleConfig, 'apiName'>,
  client: new (_options?: ApiClientOptions) => Client,
) {
  const session = getSession();
  if (!session) throw new FetchError(FetchErrorCode.NOT_LOGGED);
  return api(moduleConfig, session, client);
}
