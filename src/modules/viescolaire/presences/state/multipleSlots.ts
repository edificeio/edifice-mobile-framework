import { createAsyncActionTypes, AsyncState } from "../../../../infra/redux/async2";
import viescoConfig from "../../moduleConfig";

// THE MODEL --------------------------------------------------------------------------------------

export interface IMultipleSlots {
  allow_multiple_slots: boolean;
}


// THE STATE --------------------------------------------------------------------------------------

export type IMultipleSlotsState = AsyncState<IMultipleSlots>;

export const initialState: IMultipleSlots = {
  allow_multiple_slots: true,
};

export const getMultipleSlotsState = (globalState: any) =>
  viescoConfig.getState(globalState).presences.multipleSlots as IMultipleSlotsState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType("MULTIPLE_SLOTS"));
