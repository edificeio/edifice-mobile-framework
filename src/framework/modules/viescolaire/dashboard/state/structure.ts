import { IGlobalState } from '~/app/store';
import { StructureNode } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import viescoConfig from '~/framework/modules/viescolaire/dashboard/module-config';

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
  selectedStructure: string | undefined;
};

export const initialState: IStructureState = {
  selectedStructure: undefined,
};

export const getSelectedStructure = (globalState: IGlobalState): string | undefined =>
  viescoConfig.getState(globalState).structure.selectedStructure;

export const getStructuresList = (globalState: IGlobalState): StructureNode[] => getSession(globalState)?.user.structures ?? [];

// THE ACTION TYPES -------------------------------------------------------------------------------

export const selectStructureActionType = viescoConfig.namespaceActionType('SELECTSTRUCTURE');
