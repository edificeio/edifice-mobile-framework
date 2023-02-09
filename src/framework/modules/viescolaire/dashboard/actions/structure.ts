import { Dispatch } from 'redux';

import { IStructure, selectStructureActionType } from '~/framework/modules/viescolaire/dashboard/state/structure';

// ACTION LIST ------------------------------------------------------------------------------------

export const selectStructure = (structure: IStructure) => ({
  type: selectStructureActionType,
  selectedStructure: structure,
});

// THUNKS -----------------------------------------------------------------------------------------

export function selectStructureAction(structure: IStructure) {
  return async (dispatch: Dispatch) => {
    dispatch(selectStructure(structure));
  };
}
