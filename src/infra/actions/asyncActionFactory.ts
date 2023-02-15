import CookieManager from '@react-native-cookies/cookies';
import querystring from 'querystring';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { fetchJSONWithCache, signedFetch } from '~/infra/fetchWithCache';
import { IAsyncActionTypes } from '~/infra/redux/async';

export type IAdapterType = (receivedData: any, parentId?: string) => any;

export function asyncActionFactory(
  type: string,
  payload,
  asyncActionTypes: IAsyncActionTypes,
  adapter: IAdapterType | null,
  options,
) {
  return async (dispatch: any) => {
    const { parentId, ...body } = payload;
    let json = null;

    window.setTimeout(() => {
      if (!json) {
        dispatch({ type: asyncActionTypes.requested, payload });
      }
    }, 500);

    try {
      if (options.method != 'get') {
        const formatedBody = options.formData ? querystring.stringify(body) : JSON.stringify(body);
        const response = await signedFetch(`${DEPRECATED_getCurrentPlatform()!.url}${type}`, {
          body: formatedBody,
          headers: {
            Accept: 'application/json',
            'Content-Type': options.formData ? 'application/x-www-form-urlencoded; charset=UTF-8' : 'application/json',
          },
          method: options.method,
        });
        json = await response.json();
      } else {
        json = await fetchJSONWithCache(type);
      }
      if (json && json.error) return dispatch({ type: asyncActionTypes.fetchError, errmsg: json.error, payload });

      const data = adapter ? adapter(json, parentId) : json;

      return dispatch({ type: asyncActionTypes.received, data, receivedAt: Date.now(), payload }); // will be better to pass payload than id of payload
    } catch (errmsg) {
      return dispatch({ type: asyncActionTypes.fetchError, errmsg, payload });
    }
  };
}

export function asyncActionRawFactory(asyncActionTypes: IAsyncActionTypes, payload: any, fetch: (any) => Promise<any>) {
  let data: Response | null = null;

  return async (dispatch: any) => {
    window.setTimeout(() => {
      if (!data) {
        dispatch({ type: asyncActionTypes.requested, payload });
      }
    }, 500);

    try {
      data = await fetch(payload);
      dispatch({ type: asyncActionTypes.received, data, payload, receivedAt: Date.now() }); // will be better to pass payload than id of payload
    } catch (errmsg) {
      dispatch({ type: asyncActionTypes.fetchError, errmsg, payload });
    } finally {
      CookieManager.clearAll();
    }
  };
}
