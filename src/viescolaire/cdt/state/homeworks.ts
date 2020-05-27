import moment from "moment";

import { createAsyncActionTypes, AsyncState } from "../../../infra/redux/async2";
import viescoConfig from "../../config";

// THE MODEL --------------------------------------------------------------------------------------

export interface IHomework {
  id: string;
  date: moment.Moment;
  subject: string;
  type: string;
  completed: boolean
}

export type IHomeworkList = IHomework[];

// THE STATE --------------------------------------------------------------------------------------

export type IHomeworkListState = AsyncState<IHomeworkList>;

export const initialState: IHomeworkListState = [];

export const getHomeworkListState = (globalState: any) =>
  viescoConfig.getLocalState(globalState).homeworkList as IHomeworkListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(viescoConfig.createActionType("CDT_HOMEWORK_LIST"));
