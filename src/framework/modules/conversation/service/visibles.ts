import { IVisibles } from '~/framework/modules/conversation/state/visibles';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { IUserSession } from '~/framework/util/session';
import { signedFetchJson } from '~/infra/fetchWithCache';

export const visiblesService = {
  get: async (session: IUserSession) => {
    const api = '/conversation/visible';
    return signedFetchJson(`${DEPRECATED_getCurrentPlatform()!.url}${api}`) as Promise<IVisibles>;
  },
};
