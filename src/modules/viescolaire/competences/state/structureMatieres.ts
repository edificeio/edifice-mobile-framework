/* eslint-disable flowtype/no-types-missing-file-annotation */
import { createAsyncActionTypes, AsyncState } from "../../../../infra/redux/async2";
import viescoConfig from "../../moduleConfig";

// THE MODEL --------------------------------------------------------------------------------------

export interface IStructureMatiere {
  id: string;
  name: string;
}

export type IStructureMatiereList = IStructureMatiere[];

// THE STATE --------------------------------------------------------------------------------------

export type IStructureMatiereListState = AsyncState<IStructureMatiereList>;

export const initialState: IStructureMatiereList = [];

export const getStructureMatiereListState = (globalState: any) =>
  viescoConfig.getState(globalState).competences.structureMatiereList as IStructureMatiereListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType("COMPETENCES_STRUCTURE_MATIERES"));
