/**
 * CarnetDeBord Service
 * Controls and interpret API of the feature of Pronote.
 */
import CookieManager from '@react-native-cookies/cookies';

import { carnetDeBordAdapter } from './adapters';
import redirect from './redirect';

import { AuthActiveAccount, UserChildrenFlattened } from '~/framework/modules/auth/model';
import { IPronoteConnectorInfo, PronoteCdbInitError } from '~/framework/modules/pronote/model/carnet-de-bord';
import { IEntcoreApp } from '~/framework/util/moduleTool';
import { sessionFetch } from '~/framework/util/transport';

export type ICarnetDeBordBackend = (IPronoteConnectorInfo & {
  xmlResponse: string;
})[];

export default {
  get: async (session: AuthActiveAccount, children: UserChildrenFlattened, matchingApps: IEntcoreApp[]) => {
    const api = `/sso/pronote`;
    let data = await sessionFetch.json<any>(api);
    if (!data || typeof data === 'string') throw new Error('[carnetDeBord] received data is not Response.');
    if (data.status >= 500 && data.status < 600) {
      // If 50x, call every connector manually
      await Promise.all(
        matchingApps.map(async app => {
          const url = await redirect(session, app.address, undefined, true);
          if (url) await fetch(url);
          CookieManager.clearAll(); // No signature needed here, it's external url containing a custom ticket
        }),
      );
      // Then, retry
      data = await sessionFetch.json<any>(api);
      if (!data || typeof data === 'string') throw new Error('[carnetDeBord] received data is not Response.');
      if (data.status >= 500 && data.status < 600) {
        throw new PronoteCdbInitError('[carnetDeBord] 50x encourntered after trying to init connectors');
      }
    }
    const json = (await (data as Response).json()) as ICarnetDeBordBackend;
    return carnetDeBordAdapter(json, children);
    // Every other encountered error will be thrown.
  },
};
