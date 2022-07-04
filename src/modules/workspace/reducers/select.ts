/**
 * Workspace selection state reducer
 * Holds a list of selected item in a simple Array
 */
import { IAction } from '~/infra/redux/async';
import { actionTypesDelete } from '~/modules/workspace/actions/delete';
import { actionTypesDownload } from '~/modules/workspace/actions/download';
import { actionTypesMove } from '~/modules/workspace/actions/move';
import { actionTypesPast } from '~/modules/workspace/actions/past';
import { actionTypesRename } from '~/modules/workspace/actions/rename';
import { actionTypesRestore } from '~/modules/workspace/actions/restore';
import { SELECT_ACTION_TYPE, SELECT_CLEAR_ACTION_TYPE } from '~/modules/workspace/actions/select';
import { actionTypesUpload } from '~/modules/workspace/actions/upload';
import { IItem } from '~/modules/workspace/types';

export type IItems<T> = {
  [key: string]: T;
};

const initialState = {};

export default (state: IItems<IItem> = initialState, action: IAction<IItem>) => {
  switch (action.type) {
    case SELECT_ACTION_TYPE:
      if (state[action.data.id]) {
        delete state[action.data.id];
        return { ...state };
      }
      return {
        ...state,
        [action.data.id]: action.data,
      };
    case actionTypesDownload.received:
    case actionTypesDelete.received:
    case actionTypesRestore.received:
    case actionTypesPast.received:
    case actionTypesMove.received:
    case actionTypesUpload.received:
    case actionTypesRename.received:
    case SELECT_CLEAR_ACTION_TYPE:
      return initialState;
    default:
      return state;
  }
};
