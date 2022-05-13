import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import viescoConfig from '~/modules/viescolaire/moduleConfig';

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

export const actionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType('COMPETENCES_STRUCTURE_MATIERES'));
