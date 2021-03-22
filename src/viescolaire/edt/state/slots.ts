import moment from "moment";

import { createAsyncActionTypes, AsyncState, AsyncActionTypes } from "../../../infra/redux/async2";
import viescoConfig from "../../config";

// THE MODEL --------------------------------------------------------------------------------------

export interface ISlot {
  startHour: moment.Moment;
  endHour: moment.Moment;
  name: string;
}

export type ISlotList = ISlot[];

// THE STATE --------------------------------------------------------------------------------------

export type ISlotListState = AsyncState<ISlotList>;

export const initialState: ISlotList = [];

export const getSlotsListState = (globalState: any) =>
  viescoConfig.getLocalState(globalState).edt.slotsList as ISlotListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes: AsyncActionTypes = createAsyncActionTypes(viescoConfig.createActionType("EDT_SLOTS_LIST"));
