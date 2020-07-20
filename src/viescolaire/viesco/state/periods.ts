import moment from "moment";

import { createAsyncActionTypes, AsyncState, AsyncActionTypes } from "../../../infra/redux/async2";
import viescoConfig from "../../config";

// THE MODEL --------------------------------------------------------------------------------------

export interface IPeriod {
  start_date: moment.Moment;
  end_date: moment.Moment;
  order: number;
}

export type IPeriodsList = IPeriod[];

// THE STATE --------------------------------------------------------------------------------------

export type IPeriodsListState = AsyncState<IPeriodsList>;

export const initialState: IPeriodsList = [];

export const getPeriodsListState = (globalState: any) =>
  viescoConfig.getLocalState(globalState).viesco.periods as IPeriodsListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes: AsyncActionTypes = createAsyncActionTypes(viescoConfig.createActionType("PERIODS_LIST"));
