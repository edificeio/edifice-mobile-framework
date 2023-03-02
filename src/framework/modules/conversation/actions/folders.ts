import { Dispatch } from 'redux';

import moduleConfig from '~/framework/modules/conversation/module-config';
import { foldersService } from '~/framework/modules/conversation/service/folders';
import { IFolderList, actionTypes } from '~/framework/modules/conversation/state/folders';
import { Trackers } from '~/framework/util/tracker';
import { createAsyncActionCreators } from '~/infra/redux/async2';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IFolderList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

// export function fetchFoldersAction() {
//   return async (dispatch: Dispatch) => {
//     try {
//       dispatch(dataActions.request());
//       const data = await foldersService.get();
//       dispatch(dataActions.receipt(data));
//     } catch (errmsg) {
//       dispatch(dataActions.error(errmsg));
//     }
//   };
// }

export function postFolderAction(name: string, parentId?: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const res = await foldersService.post(name, parentId);
      if (res.error) {
        throw new Error(res.error);
      }
      Trackers.trackEventOfModule(moduleConfig, 'Créer un dossier personnalisé', 'Dossiers - Créer - Succès');
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg as Error));
      Trackers.trackEventOfModule(moduleConfig, 'Créer un dossier personnalisé', 'Dossiers - Créer - Échec'); // ToDo : give error code as value
    }
  };
}
