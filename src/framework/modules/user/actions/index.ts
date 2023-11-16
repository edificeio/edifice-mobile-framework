/**
 * Thunk actions for module user
 */
import { Moment } from 'moment';
import { AnyAction, Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { ILoggedUserProfile } from '~/framework/modules/auth/model';
import { assertSession, actions as authActions, getSession } from '~/framework/modules/auth/reducer';
import { actionTypes } from '~/framework/modules/user/reducer';
import { addTime, today } from '~/framework/util/date';
import { setItemJson } from '~/framework/util/storage';
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

const computeXmasAsyncStorageKey = () => {
  const session = getSession();
  const userId = session?.user?.id;
  return `xmasThemeSetting.${userId}`;
};

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

export const setXmasThemeAction = (xmasTheme: boolean) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const asyncStorageKey = computeXmasAsyncStorageKey();
    dispatch({ type: actionTypes.toggleXmasTheme, value: xmasTheme });
    await setItemJson(asyncStorageKey, xmasTheme);
  } catch {
    // If error, we disable theme for now
    dispatch({ type: actionTypes.toggleXmasTheme, value: false });
  }
};
