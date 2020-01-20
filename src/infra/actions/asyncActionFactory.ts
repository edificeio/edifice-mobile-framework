import { IAsyncActionTypes } from "../redux/async";
import { fetchJSONWithCache, signedFetch } from "../fetchWithCache";
import Conf from "../../../ode-framework-conf";
import querystring from "querystring";
import {ToastAndroid} from "react-native";
import I18n from "i18n-js";
import {listAction} from "../../workspace/actions/list";
import {FilterId} from "../../workspace/types";

export type IAdapterType = (receivedData: any) => any;

export function asyncActionFactory(
  type: string,
  payload: any,
  asyncActionTypes: IAsyncActionTypes,
  adapter: IAdapterType | null,
  options,
) {
  return async (dispatch: any) => {
    let json = null;
    let { parentId, ...body} = payload;

    dispatch({ type: asyncActionTypes.requested, payload });

    try {
      if (options.method === "post" || options.method === "put") {
        body = options.formData ? querystring.stringify(body) : JSON.stringify(body);
        const response = await signedFetch(`${Conf.currentPlatform.url}${type}`, {
          body,
          headers: {
            method: options.method? options.method : "get",
            Accept: "application/json",
            "Content-Type": options.formData ? "application/x-www-form-urlencoded; charset=UTF-8" : "application/json",
          },
          method: options.method,
        });
        json = await response.json();
      } else {
        json = await fetchJSONWithCache(type, {
          method: "GET",
          ...payload,
        });
      }

      const data = adapter ? adapter(json) : json;

      dispatch({ type: asyncActionTypes.received, data, receivedAt: Date.now(), payload }); // will be better to pass payload than id of payload

      if (options.refresh) {
        dispatch(listAction( {parentId: payload.parentId, filter: FilterId.owner}));
      }
    } catch (errmsg) {
      ToastAndroid.show('error', errmsg);
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
