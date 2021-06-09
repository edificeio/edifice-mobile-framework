import moment from "moment";

import { createAsyncActionTypes, AsyncState, AsyncActionTypes } from "../../../../infra/redux/async2";
import viescoConfig from "../../moduleConfig";

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
  viescoConfig.getState(globalState).edt.slotsList as ISlotListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes: AsyncActionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType("EDT_SLOTS_LIST"));
