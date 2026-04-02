// # API CONSUMER (signed, active account) FETCH

import { ApiClientOptions, BaseApiClient } from '@edifice.io/community-client-rest-rn';

import { getAccountFetch } from './fetch';

import { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/redux/reducer';
import appConf from '~/framework/util/appConf';
import { IUnkownModuleConfig } from '~/framework/util/moduleTool';
import { FetchError, FetchErrorCode } from '~/framework/util/transport/error';

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
