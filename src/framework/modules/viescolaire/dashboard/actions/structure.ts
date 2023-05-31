import { Dispatch } from 'redux';

import { selectStructureActionType } from '~/framework/modules/viescolaire/dashboard/state/structure';

// ACTION LIST ------------------------------------------------------------------------------------

export const selectStructure = (structure: string) => ({
  type: selectStructureActionType,
  selectedStructure: structure,
});

// THUNKS -----------------------------------------------------------------------------------------

export function selectStructureAction(structure: string) {
  return async (dispatch: Dispatch) => {
    dispatch(selectStructure(structure));
  };
}
