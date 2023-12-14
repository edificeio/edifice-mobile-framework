import { storage } from '~/framework/util/storage';

import { AuthSavedAccount } from './model';
import moduleConfig from './module-config';

export interface AuthStorageData {
  accounts: Record<string, AuthSavedAccount>;
  startup:
    | {
        platform?: string;
      }
    | {
        account?: string;
        platform?: string;
      };
  'show-onboarding': boolean;
}

export const authStorage = storage
  .create<AuthStorageData>()
  .withModule(moduleConfig)
  .setAppInit(function () {})
  .setSessionInit(function (session) {});

export const getSavedAccounts = () => authStorage.getJSON('accounts') ?? {};
export const getSavedStartup = () => {
  let startup = authStorage.getJSON('startup');
  const oldCurrentPlatform = storage.global.getString('currentPlatform');
  if (!startup?.platform && oldCurrentPlatform) startup = { platform: oldCurrentPlatform };
  return { ...startup } as AuthStorageData['startup'];
};
export const getShowOnbording = () => authStorage.getBoolean('show-onboarding') ?? true;

/** read old auth values in storage */
// export const getLegagyAuthInformation = () => {
//   const currentPlatform = storage.global.getString('currentPlatform');
//   const tokenStr = storage.global.getString('token');
//   const token = tokenStr ? (JSON.parse(tokenStr) as IOAuthToken) : undefined;
//   return { currentPlatform, token };
// };
