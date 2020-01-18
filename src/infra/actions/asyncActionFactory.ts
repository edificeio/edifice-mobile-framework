import { IAsyncActionTypes } from "../redux/async";
import { fetchJSONWithCache, signedFetch } from "../fetchWithCache";
import Conf from "../../../ode-framework-conf";
import querystring from "querystring";

export type IAdapterType = (receivedData: any) => any;

export function asyncActionFactory(
  type: string,
  payload: any,
  asyncActionTypes: IAsyncActionTypes,
  options,
  adapter: IAdapterType
) {
  return async (dispatch: any) => {
    let json = null;

    dispatch({ type: asyncActionTypes.requested, payload });

    try {
      if (options.post) {
        const body = options.formData ? querystring.stringify(payload) : JSON.stringify(payload);
        const response = await signedFetch(`${Conf.currentPlatform.url}${type}`, {
          body,
          headers: {
            Accept: options.formData ? "*/*" : "application/json",
            "Content-Type": options.formData ? "application/x-www-form-urlencoded; charset=UTF-8" : "application/json",
          },
          method: "POST",
        });
        json = await response.json();
      } else {
        json = await fetchJSONWithCache(type, {
          method: "GET",
          ...payload,
        });
      }

      const data = adapter(json);

      dispatch({ type: asyncActionTypes.received, data, receivedAt: Date.now(), payload }); // will be better to pass payload than id of payload
    } catch (errmsg) {
      dispatch({ type: asyncActionTypes.fetchError, errmsg, payload });
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
