import { asyncFetchJson, IAsyncActionTypes } from "../redux/async";
import { fetchJSONWithCache, signedFetch } from "../fetchWithCache";
import Conf from "../../../ode-framework-conf";
import objectToFormData from "object-to-formdata";
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

    dispatch({ type: asyncActionTypes.requested, id: payload.id });

    try {
      if (options.post) {
        const body = options.formData ? querystring.stringify(payload) : payload
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

      dispatch({ type: asyncActionTypes.received, data, receivedAt: Date.now(), id: payload.id, payload }); // will be better to pass payload than id of payload
    } catch (errmsg) {
      dispatch({ type: asyncActionTypes.fetchError, errmsg, id: payload.id, payload });
    }
  };
}
