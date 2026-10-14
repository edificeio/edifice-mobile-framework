import appConf, { Platform } from '~/framework/util/appConf';

import { AuthCredentials, AuthSavedAccount } from '../model';
import { getToken } from './token';

export const signIn = {
  withCredentials: async (
    _platform: Platform['name'],
    credentials: AuthCredentials,
    screenKey: number,
    accountToReplace?: AuthSavedAccount['user']['id'],
  ) => {
    const platform = appConf.assertPlatformOfName(_platform);
    const token = await getToken(platform, credentials);
    console.info('TOKEN GET', token);
  },
};
