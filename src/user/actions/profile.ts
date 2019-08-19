import userConfig from "../config";
import { Dispatch } from "redux";
import Conf from "../../../ode-framework-conf";
import { signedFetch } from "../../infra/fetchWithCache";

// TYPES

export interface IUpdatableProfileValues {
  displayName?: string,
  email?: string,
  homePhone?: string,
  mobile?: string,
}

// ACTION TYPES

export const actionTypeProfileUpdateRequested = userConfig.createActionType("PROFILE_UPDATE_REQUESTED");
export const actionTypeProfileUpdateSuccess = userConfig.createActionType("PROFILE_UPDATE_SUCCESS");
export const actionTypeProfileUpdateError = userConfig.createActionType("PROFILE_UPDATE_ERROR");

// ACTION BUILDERS

const profileUpdateActionBuilder = (type: string) => (updatedProfileValues: IUpdatableProfileValues) => ({
  type,
  updatedProfileValues
})

export const profileUpdateRequestedAction = profileUpdateActionBuilder(actionTypeProfileUpdateRequested);

export const profileUpdateSuccessAction = profileUpdateActionBuilder(actionTypeProfileUpdateSuccess);

export const profileUpdateErrorAction = profileUpdateActionBuilder(actionTypeProfileUpdateError);

// THUNKS

export function profileUpdateAction(updatedProfileValues: IUpdatableProfileValues) {
  return async (dispatch: Dispatch, getState: () => any) => {
    if (!Conf.currentPlatform) throw new Error("must specify a platform");
    dispatch(profileUpdateRequestedAction(updatedProfileValues));
    try {
      const userId = getState().user.info.id;
      await signedFetch(
        `${Conf.currentPlatform.url}/directory/user/${userId}`,
        {
          method: "PUT",
          body: JSON.stringify(updatedProfileValues)
        }
      );
      dispatch(profileUpdateSuccessAction(updatedProfileValues));
    } catch (e) {
      console.warn(e);
      dispatch(profileUpdateErrorAction(updatedProfileValues));
    }
  }
}

