import { Dispatch } from 'redux';

import { IGlobalState } from '~/AppStore';
import { getFlattenedChildren } from '~/framework/modules/auth/model';
import { assertSession } from '~/framework/modules/auth/reducer';

import moduleConfig from '../moduleConfig';
import { actions as carnetDeBordAsyncActions } from '../reducer/carnet-de-bord';
import carnetDeBordService from '../service/carnetDeBord';

export const loadCarnetDeBordAction = () => async (dispatch: Dispatch, getState: () => IGlobalState) => {
  try {
    const session = assertSession();
    const children = getFlattenedChildren(session.user.children);
    dispatch(carnetDeBordAsyncActions.request());
    const matchingApps = moduleConfig.getMatchingEntcoreApps(session.apps);
    const data = await carnetDeBordService.get(session, children ?? [], matchingApps);
    dispatch(carnetDeBordAsyncActions.receipt(data));
    return data;
  } catch (e) {
    dispatch(carnetDeBordAsyncActions.error(e as Error));
    throw e;
  }
};
