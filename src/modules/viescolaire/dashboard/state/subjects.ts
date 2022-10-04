import { AsyncActionTypes, AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import viescoConfig from '~/modules/viescolaire/dashboard/moduleConfig';

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

export const getSubjectsListState = (globalState: any) => viescoConfig.getState(globalState).subjectsList as ISubjectListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes: AsyncActionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType('SUBJECT_LIST'));
