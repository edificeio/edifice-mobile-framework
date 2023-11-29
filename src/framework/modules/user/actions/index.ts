/**
 * Thunk actions for user module
 */
import { Moment } from 'moment';
import { EmitterSubscription, Vibration } from 'react-native';
import RNShake from 'react-native-shake';
import { AnyAction, Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { ILoggedUserProfile } from '~/framework/modules/auth/model';
import { assertSession, actions as authActions } from '~/framework/modules/auth/reducer';
import { actionTypes } from '~/framework/modules/user/reducer';
import { addTime, today } from '~/framework/util/date';
import { getItemJson, setItemJson } from '~/framework/util/storage';
import { Trackers } from '~/framework/util/tracker';
import { signedFetchJson } from '~/infra/fetchWithCache';
import { refreshSelfAvatarUniqueKey } from '~/ui/avatars/Avatar';

export type UpdatableProfileValues = Partial<ILoggedUserProfile>;

export function profileUpdateAction(newValues: UpdatableProfileValues) {
  return async (dispatch: Dispatch & ThunkDispatch<any, void, AnyAction>, getState: () => IGlobalState) => {
    const isUpdatingPhoto = newValues.photo !== undefined;

    const session = assertSession();

    for (const key in newValues) {
      if (newValues[key] !== undefined) {
        if (
          key.match(/Valid/) ||
          newValues[key as keyof UpdatableProfileValues] === session.user[key] ||
          key === 'updatingAvatar'
        ) {
          delete newValues[key as keyof UpdatableProfileValues];
        }
      }
    }

    dispatch(authActions.profileUpdateRequest(newValues));
    try {
      const userId = session.user.id;
      const updatedValues = isUpdatingPhoto ? { ...newValues, picture: newValues.photo } : newValues;
      const reponse = await signedFetchJson(`${session.platform.url}/directory/user${isUpdatingPhoto ? 'book' : ''}/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedValues),
      });
      if ((reponse as any).error) {
        throw new Error((reponse as any).error);
      }
      dispatch(authActions.profileUpdateSuccess(newValues));
      if (isUpdatingPhoto) {
        refreshSelfAvatarUniqueKey();
      }
      Trackers.trackEvent('Profile', 'UPDATE');
    } catch (e) {
      dispatch(authActions.profileUpdateError());

      if ((e as Error).message.match(/loginAlias/)) {
        Trackers.trackEvent('Profile', 'UPDATE ERROR', 'user-profilechange-login-error');
      } else {
        Trackers.trackEvent('Profile', 'UPDATE ERROR', `${isUpdatingPhoto ? 'Avatar' : 'Profile'}ChangeError`);
      }
    }
  };
}

const xmasStorageKey = 'xmasThemeSetting';
const snowDuration = 20000;
let snowfallTimer: NodeJS.Timeout;

const getIsWithinXmasPeriod = (startDay: number, startMonth: number, endDay: number, endMonth: number) => {
  const getDateForYear = (startOfYear: Moment, day: number, month: number) => {
    const monthOfYear = addTime(startOfYear, month - 1, 'month');
    const dateOfYear = addTime(monthOfYear, day - 1, 'day');
    return dateOfYear;
  };
  const startOfThisYear = today().startOf('year');
  const startOfNextYear = addTime(today(), 1, 'year').startOf('year');
  const startDateThisYear = getDateForYear(startOfThisYear, startDay, startMonth);
  const endDateNextYear = getDateForYear(startOfNextYear, endDay, endMonth);
  const isWithinXmasPeriod = today().isBetween(startDateThisYear, endDateNextYear);
  return isWithinXmasPeriod;
};

export const isWithinXmasPeriod = getIsWithinXmasPeriod(1, 12, 5, 1);

export const getIsXmasActive = (state: IGlobalState) => isWithinXmasPeriod && state.user.xmasTheme;

export const letItSnowAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => {
  try {
    if (!getIsXmasActive(getState())) return;
    dispatch({ type: actionTypes.setFlakes, value: true });
    if (snowfallTimer) {
      clearTimeout(snowfallTimer);
    }
    snowfallTimer = setTimeout(() => dispatch({ type: actionTypes.setFlakes, value: false }), snowDuration);
  } catch {
    // ToDo: Error handling
  }
};

export const stopItSnowAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => {
  try {
    if (!getIsXmasActive(getState())) return;
    dispatch({ type: actionTypes.setFlakes, value: false });
    if (snowfallTimer) {
      clearTimeout(snowfallTimer);
    }
  } catch {
    // ToDo: Error handling
  }
};

let shakeListener: EmitterSubscription | undefined;

const updateShakeListenerAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => {
  try {
    if (!shakeListener && getIsXmasActive(getState())) {
      shakeListener = RNShake.addListener(() => {
        Vibration.vibrate();
        dispatch(letItSnowAction());
      });
    } else if (shakeListener && !getIsXmasActive(getState())) {
      shakeListener.remove();
      shakeListener = undefined;
    }
  } catch {
    // Nothing
  }
};

export const setXmasThemeAction = (xmasTheme: boolean) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    await setItemJson(xmasStorageKey, xmasTheme);
    dispatch({ type: actionTypes.toggleXmasTheme, value: xmasTheme });
    if (xmasTheme) dispatch(letItSnowAction());
    dispatch(updateShakeListenerAction());
  } catch {
    // If error, we disable theme for now
    dispatch({ type: actionTypes.toggleXmasTheme, value: false });
  }
};

export const importXmasThemeAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => {
  try {
    let xmasSetting;
    xmasSetting = (await getItemJson(xmasStorageKey)) as boolean | undefined;
    // The setting is undefined on first launch (we set the theme on by default)
    if (xmasSetting === undefined) {
      await setItemJson(xmasStorageKey, true);
      xmasSetting = true;
    }
    const xmasTheme = xmasSetting && isWithinXmasPeriod;
    dispatch({ type: actionTypes.toggleXmasTheme, value: xmasTheme });
    if (xmasTheme) dispatch(letItSnowAction());
    dispatch(updateShakeListenerAction());
  } catch {
    // If error, we reset to the inital behavior => theme on
    dispatch({ type: actionTypes.toggleXmasTheme, value: true });
    return true;
  }
};
