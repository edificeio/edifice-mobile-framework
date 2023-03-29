/**
 * Thunk actions for module user
 */
import I18n from 'i18n-js';
import { AnyAction, Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { ILoggedUserProfile } from '~/framework/modules/auth/model';
import { assertSession, actions as authActions } from '~/framework/modules/auth/reducer';
import { notifierShowAction } from '~/framework/util/notifier/actions';
import { Trackers } from '~/framework/util/tracker';
import { signedFetchJson } from '~/infra/fetchWithCache';
import { refreshSelfAvatarUniqueKey } from '~/ui/avatars/Avatar';

export type UpdatableProfileValues = ILoggedUserProfile;

export function profileUpdateAction(newValues: UpdatableProfileValues) {
  return async (dispatch: Dispatch & ThunkDispatch<any, void, AnyAction>, getState: () => IGlobalState) => {
    const isUpdatingPhoto = newValues.photo !== undefined;
    const notifierId = `profile${isUpdatingPhoto ? 'One' : 'Two'}`;
    const notifierSuccessText = I18n.t(`ProfileChange${isUpdatingPhoto ? 'Avatar' : ''}Success`);
    const getNotifierErrorText = () => {
      if (isUpdatingPhoto) {
        return !newValues.photo ? I18n.t('ProfileDeleteAvatarError') : I18n.t('ProfileChangeAvatarErrorAssign');
      } else {
        return I18n.t('ProfileChangeError');
      }
    };

    const platform = assertSession().platform;

    for (const key in newValues) {
      if (newValues[key] !== undefined) {
        if (key.match(/Valid/) || newValues[key as keyof UpdatableProfileValues] === getState().user.info[key]) {
          delete newValues[key as keyof UpdatableProfileValues];
        }
      }
    }

    dispatch(authActions.profileUpdateRequest(newValues));
    try {
      const userId = getState().user.info.id;
      const reponse = await signedFetchJson(`${platform.url}/directory/user${isUpdatingPhoto ? 'book' : ''}/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(newValues),
      });
      if ((reponse as any).error) {
        throw new Error((reponse as any).error);
      }
      dispatch(authActions.profileUpdateSuccess(newValues));
      dispatch(
        notifierShowAction({
          id: notifierId,
          text: notifierSuccessText,
          icon: 'checked',
          type: 'success',
        }),
      );
      if (isUpdatingPhoto) {
        refreshSelfAvatarUniqueKey();
      }
      Trackers.trackEvent('Profile', 'UPDATE');
    } catch (e) {
      dispatch(authActions.profileUpdateError());

      if ((e as Error).message.match(/loginAlias/)) {
        dispatch(
          notifierShowAction({
            id: notifierId,
            text: I18n.t('ProfileChangeLoginError'),
            icon: 'close',
            type: 'error',
          }),
        );
        Trackers.trackEvent('Profile', 'UPDATE ERROR', 'ProfileChangeLoginError');
      } else {
        dispatch(
          notifierShowAction({
            id: notifierId,
            text: getNotifierErrorText(),
            icon: 'close',
            type: 'error',
          }),
        );
        Trackers.trackEvent('Profile', 'UPDATE ERROR', `${isUpdatingPhoto ? 'Avatar' : 'Profile'}ChangeError`);
      }
    }
  };
}
