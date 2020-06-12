import { createAsyncActionTypes, AsyncState, AsyncActionTypes } from "../../../infra/redux/async2";
import viescoConfig from "../../config";

// THE MODEL --------------------------------------------------------------------------------------

export interface ISubject {
  subjectCode: string;
  subjectId: string;
  subjectLabel: string;
}

export type ISubjectList = ISubject[];

// THE STATE --------------------------------------------------------------------------------------

export type ISubjectListState = AsyncState<ISubjectList>;

export const initialState: ISubjectList = [];

export const getSubjectsListState = (globalState: any) =>
  viescoConfig.getLocalState(globalState).viesco.subjectsList as ISubjectListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes : AsyncActionTypes = createAsyncActionTypes(viescoConfig.createActionType("VIESCO_SUBJECT_LIST"));
