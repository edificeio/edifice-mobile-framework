/**
 * Thunk actions for user module
 */
import { AnyAction, Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { ILoggedUserProfile } from '~/framework/modules/auth/model';
import { assertSession, actions as authActions } from '~/framework/modules/auth/reducer';
import { sessionFetch } from '~/framework/util/transport';
import { refreshSelfAvatarUniqueKey } from '~/ui/avatars/Avatar';

export function profileUpdateAction(newValues: Partial<ILoggedUserProfile>) {
  return async (dispatch: Dispatch & ThunkDispatch<any, void, AnyAction>, getState: () => IGlobalState) => {
    const isUpdatingPhoto = newValues.avatar !== undefined;

    const session = assertSession();

    for (const key in newValues) {
      if (newValues[key] !== undefined) {
        if (
          key.match(/Valid/) ||
          newValues[key as keyof Partial<ILoggedUserProfile>] === session.user[key] ||
          key === 'updatingAvatar'
        ) {
          delete newValues[key as keyof Partial<ILoggedUserProfile>];
        }
      }
    }

    try {
      const userId = session.user.id;
      const updatedValues = isUpdatingPhoto ? { ...newValues, picture: newValues.avatar } : newValues;
      const reponse = await sessionFetch.json(`/directory/user${isUpdatingPhoto ? 'book' : ''}/${userId}`, {
        body: JSON.stringify(updatedValues),
        method: 'PUT',
      });

      if ((reponse as any).error) {
        throw new Error((reponse as any).error);
      }
      dispatch(authActions.profileUpdate(userId, newValues));
      if (isUpdatingPhoto) {
        refreshSelfAvatarUniqueKey();
      }
    } catch (e) {
      if ((e as Error).message.match(/loginAlias/)) {
        // Tracking was here
      } else {
        // Tracking was here
      }
    }
  };
}
