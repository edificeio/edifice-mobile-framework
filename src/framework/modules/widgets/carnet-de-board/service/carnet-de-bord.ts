/**
 * CarnetDeBord Service
 * Controls and interpret API of the feature of Pronote.
 */
import CookieManager from '@preeternal/react-native-cookie-manager';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { getStore, IGlobalState } from '~/app/store';
import { AuthActiveAccount, UserChildrenFlattened } from '~/framework/modules/auth/model';
import { refreshQueryParamTokenAction } from '~/framework/modules/auth/thunks';
import { IPronoteConnectorInfo, PronoteCdbInitError } from '~/framework/modules/widgets/carnet-de-board/model/carnet-de-bord';
import { IEntcoreApp } from '~/framework/util/moduleTool';
import { sessionFetch } from '~/framework/util/transport';
import { HTTPError } from '~/framework/util/transport/error';

import { carnetDeBordAdapter } from './adapters';
import redirect from './redirect';

export type ICarnetDeBordBackend = (IPronoteConnectorInfo & {
  xmlResponse: string;
})[];

export default {
  get: async (session: AuthActiveAccount, children: UserChildrenFlattened, matchingApps: IEntcoreApp[]) => {
    const api = `/sso/pronote`;
    try {
      let data = await sessionFetch(api);
      if (!data || typeof data === 'string') throw new Error('[carnetDeBord] received data is not Response.');
      const json = (await (data as Response).json()) as ICarnetDeBordBackend;
      return carnetDeBordAdapter(json, children);
    } catch (e) {
      if (e instanceof HTTPError && e.status >= 500 && e.status < 600) {
        // If 50x, call every connector manually
        // This duplicated some code of openUrl... Ugly but functionnal
        await Promise.allSettled(
          matchingApps.map(async app => {
            const urlStr = await redirect(session, app.address, undefined, true);
            if (!urlStr) return;
            const url = new URL(urlStr);
            const urlOrigin = url.origin;
            const dispatch = getStore().dispatch as ThunkDispatch<IGlobalState, never, Action>;
            const isUrlInternal = session && urlOrigin === session.platform.url;

            if (isUrlInternal) {
              try {
                const queryParamToken = await dispatch(refreshQueryParamTokenAction(session));
                if (queryParamToken && url) {
                  url.searchParams.append('queryparam_token', queryParamToken.value);
                }
              } catch (_e) {
                console.error('[carnet de bord] - Error getting query param token: ', _e);
              }
            }

            await fetch(url.href);
            CookieManager.clearAll(); // No signature needed here, it's external url containing a custom ticket
          }),
        );
        // Then, retry
        try {
          let data = await sessionFetch(api);
          if (!data || typeof data === 'string') throw new Error('[carnetDeBord] received data is not Response.');
          const json = (await (data as Response).json()) as ICarnetDeBordBackend;
          return carnetDeBordAdapter(json, children);
        } catch (ee) {
          if (ee instanceof HTTPError && ee.status >= 500 && ee.status < 600) {
            throw new PronoteCdbInitError('[carnetDeBord] 50x encourntered after trying to init connectors');
          } else {
            // Every other encountered error will be thrown.
            throw ee;
          }
        }
      } else {
        throw e;
      }
    }
  },
};
