import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { IUserSession } from '~/framework/util/session';
import { signedFetchJson } from '~/infra/fetchWithCache';
import { IVisibles } from '~/modules/conversation/state/visibles';

export const visiblesService = {
  get: async (session: IUserSession) => {
    const api = '/conversation/visible';
    return signedFetchJson(`${DEPRECATED_getCurrentPlatform()!.url}${api}`) as Promise<IVisibles>;
  },
};
