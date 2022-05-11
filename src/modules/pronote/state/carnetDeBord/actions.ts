import { Dispatch } from 'redux';

import { IGlobalState } from '~/AppStore';
import { getUserSession } from '~/framework/util/session';
import { IUserInfoState } from '~/user/state/info';

import carnetDeBordService, { IChildrenInfo } from '../../service/carnetDeBord';
import { actions as carnetDeBordAsyncActions } from './reducer';

export const loadCarnetDeBordAction = () => async (dispatch: Dispatch, getState: () => IGlobalState) => {
  try {
    const session = getUserSession();

    // 1. Compute children array (LABORIOUS !!!! 😤)
    const structures = (getState().user.info as IUserInfoState).childrenStructure ?? [];
    const childrenPartialInfo = (getState().user.info as IUserInfoState).children ?? [];
    const childrenPartialInfoArray = Object.entries(childrenPartialInfo);
    const children: IChildrenInfo = [];
    for (const structure of structures) {
      for (const child of structure.children) {
        const correspondingChild = childrenPartialInfoArray.find(c => c[0] === child.id);
        if (!correspondingChild) throw new Error(`Child "${child.displayName}" not found in partial info.`);
        children.push({
          id: child.id,
          displayName: child.displayName,
          firstName: correspondingChild[1].firstName,
          lastName: correspondingChild[1].lastName,
        });
      }
    }

    // 2. Call !
    dispatch(carnetDeBordAsyncActions.request());
    const data = await carnetDeBordService.get(session, children);
    dispatch(carnetDeBordAsyncActions.receipt(data));
    return data;
  } catch (e) {
    console.warn(e);
    dispatch(carnetDeBordAsyncActions.error(e as Error));
    throw e;
  }
};
