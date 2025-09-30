import moduleConfig from '~/framework/modules/mediacentre/module-config';
import {
  AsyncState,
  createAsyncActionCreators,
  createAsyncActionTypes,
  createSessionAsyncReducer,
} from '~/framework/util/redux/async';

export type SelectedStructureStateData = string | null;
export type SelectedStructureState = AsyncState<SelectedStructureStateData>;

const initialState: SelectedStructureStateData = null;

export const actionTypes = {
  ...createAsyncActionTypes(moduleConfig.namespaceActionType('SELECTED_STRUCTURE')),
  editError: moduleConfig.namespaceActionType('SELECTED_STRUCTURE_EDIT_ERROR'),
  editReceipt: moduleConfig.namespaceActionType('SELECTED_STRUCTURE_EDIT_RECEIPT'),
  editRequest: moduleConfig.namespaceActionType('SELECTED_STRUCTURE_EDIT_REQUEST'),
};
export const actions = {
  ...createAsyncActionCreators<SelectedStructureStateData>(actionTypes),
  editError: (error: Error) => ({ error, type: actionTypes.editError }),
  editReceipt: (id: string) => ({ id, type: actionTypes.editReceipt }),
  editRequest: () => ({ type: actionTypes.editRequest }),
};

const editSelectedStructureHandlerMap = {
  [actionTypes.editReceipt]: (state: SelectedStructureStateData, action) => {
    return action.id;
  },
};

export default createSessionAsyncReducer(initialState, actionTypes, editSelectedStructureHandlerMap);
