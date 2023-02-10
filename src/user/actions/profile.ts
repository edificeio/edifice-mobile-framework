import I18n from 'i18n-js';
import { AnyAction, Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { Trackers } from '~/framework/util/tracker';
import { signedFetchJson } from '~/infra/fetchWithCache';
import { notifierShowAction } from '~/infra/notifier/actions';
import { refreshSelfAvatarUniqueKey } from '~/ui/avatars/Avatar';
import userConfig from '~/user/config';

export interface IUpdatableProfileValues {
  displayName?: string;
  homePhone?: string;
  loginAlias?: string;
}

export const actionTypeProfileUpdateRequested = userConfig.createActionType('PROFILE_UPDATE_REQUESTED');
export const actionTypeProfileUpdateSuccess = userConfig.createActionType('PROFILE_UPDATE_SUCCESS');
export const actionTypeProfileUpdateError = userConfig.createActionType('PROFILE_UPDATE_ERROR');

const profileUpdateActionBuilder = (type: string) => (updatedProfileValues: IUpdatableProfileValues) => ({
  type,
  updatedProfileValues,
});

export const profileUpdateRequestedAction = profileUpdateActionBuilder(actionTypeProfileUpdateRequested);

export const profileUpdateSuccessAction = profileUpdateActionBuilder(actionTypeProfileUpdateSuccess);

export const profileUpdateErrorAction = profileUpdateActionBuilder(actionTypeProfileUpdateError);

export function profileUpdateAction(updatedProfileValues: IUpdatableProfileValues, updateAvatar?: boolean, notify: boolean = true) {
  return async (dispatch: Dispatch & ThunkDispatch<any, void, AnyAction>, getState: () => any) => {
    const notifierId = `profile${updateAvatar ? 'One' : 'Two'}`;
    const notifierSuccessText = I18n.t(`ProfileChange${updateAvatar ? 'Avatar' : ''}Success`);
    const getNotifierErrorText = () => {
      if (updateAvatar) {
        return updatedProfileValues.picture === '' ? I18n.t('ProfileDeleteAvatarError') : I18n.t('ProfileChangeAvatarErrorAssign');
      } else {
        return I18n.t('ProfileChangeError');
      }
    };

    if (!DEPRECATED_getCurrentPlatform()) throw new Error('must specify a platform');

    for (const index in updatedProfileValues) {
      if (updatedProfileValues.hasOwnProperty(index)) {
        if (index.match(/Valid/) || updatedProfileValues[index as keyof IUpdatableProfileValues] === getState().user.info[index]) {
          delete updatedProfileValues[index as keyof IUpdatableProfileValues];
        }
      }
    }

    dispatch(profileUpdateRequestedAction(updatedProfileValues));
    try {
      const userId = getState().user.info.id;
      const reponse = await signedFetchJson(
        `${DEPRECATED_getCurrentPlatform()!.url}/directory/user${updateAvatar ? 'book' : ''}/${userId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updatedProfileValues),
        },
      );
      if ((reponse as any)['error']) {
        throw new Error((reponse as any)['error']);
      }
      dispatch(profileUpdateSuccessAction(updateAvatar ? { photo: updatedProfileValues.picture } : updatedProfileValues));
      if (notify)
        dispatch(
          notifierShowAction({
            id: notifierId,
            text: notifierSuccessText,
            icon: 'checked',
            type: 'success',
          }),
        );
      if (updateAvatar) {
        refreshSelfAvatarUniqueKey();
      }
      Trackers.trackEvent('Profile', 'UPDATE');
    } catch (e) {
      dispatch(profileUpdateErrorAction(updatedProfileValues));

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
        Trackers.trackEvent('Profile', 'UPDATE ERROR', `${updateAvatar ? 'Avatar' : 'Profile'}ChangeError`);
      }
    }
  };
}
