import { Dispatch } from 'redux';

import { IGlobalState } from '~/app/store';
import { getFlattenedChildren, ILoggedUser } from '~/framework/modules/auth/model';
import { assertSession } from '~/framework/modules/auth/redux/reducer';
import { actions as carnetDeBordAsyncActions } from '~/framework/modules/widgets/carnet-de-board/reducer/carnet-de-bord';
import carnetDeBordService from '~/framework/modules/widgets/carnet-de-board/service/carnet-de-bord';

export const loadCarnetDeBordAction = () => async (dispatch: Dispatch, _getState: () => IGlobalState) => {
  try {
    const session = assertSession();
    const user = session?.user as ILoggedUser | undefined;

    const children = getFlattenedChildren(user?.children);
    dispatch(carnetDeBordAsyncActions.request());
    const pronoteConnectors = session.rights.apps.filter(app => app.casType === 'PronoteRegisteredService');
    const data = await carnetDeBordService.get(session, children ?? [], pronoteConnectors);
    dispatch(carnetDeBordAsyncActions.receipt(data));
    return data;
  } catch (e) {
    dispatch(carnetDeBordAsyncActions.error(e as Error));
    throw e;
  }
};
