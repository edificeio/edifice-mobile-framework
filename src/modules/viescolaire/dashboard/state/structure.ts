import viescoConfig from '~/modules/viescolaire/dashboard/moduleConfig';
import userConfig from '~/user/config';

// THE MODEL --------------------------------------------------------------------------------------

export interface IStructure {
  name: string;
  id: string;
}

export type IStructureArray = {
  structure: IStructure[];
};

// THE STATE --------------------------------------------------------------------------------------

export type IStructureState = {
  selectedStructure: string | null;
};

export const initialState: IStructureState = {
  selectedStructure: null,
};

export const getSelectedStructure = (globalState: any) => viescoConfig.getState(globalState).structure.selectedStructure;

export const getStructuresList = (globalState: any) => userConfig.getLocalState(globalState).info.schools;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const selectStructureActionType = viescoConfig.namespaceActionType('SELECTSTRUCTURE');
