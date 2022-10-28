import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import moduleConfig from '~/modules/viescolaire/presences/moduleConfig';

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
moduleConfig.getState(globalState).multipleSlots as IMultipleSlotsState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(moduleConfig.namespaceActionType('MULTIPLE_SLOTS'));
