/**
 * Thunk actions for module user
 */
import { AnyAction, Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { ILoggedUserProfile } from '~/framework/modules/auth/model';
import { assertSession, actions as authActions } from '~/framework/modules/auth/reducer';
import { notifierShowAction } from '~/framework/util/notifier/actions';
import { Trackers } from '~/framework/util/tracker';
import { signedFetchJson } from '~/infra/fetchWithCache';
import { refreshSelfAvatarUniqueKey } from '~/ui/avatars/Avatar';

export type UpdatableProfileValues = Partial<ILoggedUserProfile>;

export function profileUpdateAction(newValues: UpdatableProfileValues) {
  return async (dispatch: Dispatch & ThunkDispatch<any, void, AnyAction>, getState: () => IGlobalState) => {
    const isUpdatingPhoto = newValues.photo !== undefined;
    const notifierId = `profile${isUpdatingPhoto ? 'One' : 'Two'}`;
    const notifierSuccessText = I18n.get(`user-profilechange${isUpdatingPhoto ? '-avatar' : ''}-success`);
    const getNotifierErrorText = () => {
      if (isUpdatingPhoto) {
        return !newValues.photo
          ? I18n.get('user-profilechange-avatar-error-delete')
          : I18n.get('user-profilechange-avatar-error-assign');
      } else {
        return I18n.get('user-profilechange-error');
      }
    };

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
            text: I18n.get('user-profilechange-login-error'),
            icon: 'close',
            type: 'error',
          }),
        );
        Trackers.trackEvent('Profile', 'UPDATE ERROR', 'user-profilechange-login-error');
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
