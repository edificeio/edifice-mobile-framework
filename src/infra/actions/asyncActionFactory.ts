import { IAsyncActionTypes } from "../redux/async";
import { fetchJSONWithCache, signedFetch } from "../fetchWithCache";
import Conf from "../../../ode-framework-conf";
import querystring from "querystring";
import {ToastAndroid} from "react-native";

export type IAdapterType = ( receivedData: any, parentId?: string) => any;

export function asyncActionFactory(
  type: string,
  payload,
  asyncActionTypes: IAsyncActionTypes,
  adapter: IAdapterType | null,
  options,
) {
  return async (dispatch: any) => {
    const { parentId, ...body} = payload;
    let json = null;

    dispatch({ type: asyncActionTypes.requested, payload });

    try {
      if (options.method === "post" || options.method === "put") {
        const formatedBody = options.formData ? querystring.stringify(body) : JSON.stringify(body);
        const response = await signedFetch(`${Conf.currentPlatform.url}${type}`, {
          body: formatedBody,
          headers: {
            method: options.method,
            Accept: "application/json",
            "Content-Type": options.formData ? "application/x-www-form-urlencoded; charset=UTF-8" : "application/json",
          },
          method: options.method,
        });
        json = await response.json();
      } else {
        json = await fetchJSONWithCache(type);
      }

      const data = adapter ? adapter( json, parentId) : json;

      return dispatch({ type: asyncActionTypes.received, data, receivedAt: Date.now(), payload }); // will be better to pass payload than id of payload

    } catch (errmsg) {
      ToastAndroid.show('error', errmsg);
      return dispatch({ type: asyncActionTypes.fetchError, errmsg, payload });
    }
  };
}

export function asyncActionRawFactory(
  asyncActionTypes: IAsyncActionTypes,
  payload: any,
  fetch: (any) => Promise<any>
) {
  return async (dispatch: any) => {
    dispatch({ type: asyncActionTypes.requested, payload });

    try {
      const data = await fetch(payload);

      dispatch({ type: asyncActionTypes.received, data, payload, receivedAt: Date.now() }); // will be better to pass payload than id of payload
    } catch (errmsg) {
      dispatch({ type: asyncActionTypes.fetchError, errmsg, payload });
    }
  };
}
