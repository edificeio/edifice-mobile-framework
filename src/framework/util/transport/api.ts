// # API CONSUMER (signed, active account) FETCH

import { ApiClientOptions, BaseApiClient } from '@edifice.io/community-client-rest-rn/clients/base-api.client';

import { getAccountFetch } from './fetch';

import { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import appConf from '~/framework/util/appConf';
import { FetchError, FetchErrorCode } from '~/framework/util/http/error';
import { IUnkownModuleConfig } from '~/framework/util/moduleTool';

export function accountApi<Client extends BaseApiClient>(
  account: AuthActiveAccount | AuthSavedLoggedInAccount,
  moduleConfig: Pick<IUnkownModuleConfig, 'apiName'>,
  client: new (_options?: ApiClientOptions) => Client,
) {
  const platform = appConf.getExpandedPlatform(account.platform);
  if (!platform) throw new FetchError(FetchErrorCode.NOT_LOGGED, '[useApi] No platform provided');
  const fetchImpl = getAccountFetch(account);
  return new client({
    baseUrl: platform.url + '/' + moduleConfig.apiName,
    fetchImpl,
  });
}

export function sessionApi<Client extends BaseApiClient>(
  moduleConfig: Pick<IUnkownModuleConfig, 'apiName'>,
  client: new (_options?: ApiClientOptions) => Client,
) {
  const account = getSession();
  if (!account) throw new FetchError(FetchErrorCode.NOT_LOGGED, '[useSessionApi] No session provided');
  const platform = appConf.getExpandedPlatform(account.platform);
  if (!platform) throw new FetchError(FetchErrorCode.NOT_LOGGED, '[useSessionApi] No platform provided');
  const fetchImpl = getAccountFetch(account);
  return new client({
    baseUrl: platform.url + '/' + moduleConfig.apiName,
    fetchImpl,
  });
}
