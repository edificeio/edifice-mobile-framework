/* eslint-disable flowtype/no-types-missing-file-annotation */
import { createAsyncActionTypes, AsyncState } from "../../../infra/redux/async2";
import viescoConfig from "../../config";

// THE MODEL --------------------------------------------------------------------------------------

export interface IMatiere {
  id: string;
  externalId: string;
  name: string;
}

export type IMatiereList = IMatiere[];

// THE STATE --------------------------------------------------------------------------------------

export type IMatiereListState = AsyncState<IMatiereList>;

export const initialState: IMatiereList = [];

export const getMatiereListState = (globalState: any) =>
  viescoConfig.getLocalState(globalState).competences.matieres as IMatiereListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(viescoConfig.createActionType("COMPETENCES_MATIERES"));
