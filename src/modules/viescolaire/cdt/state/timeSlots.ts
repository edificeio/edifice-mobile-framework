import moment from 'moment';

import { createAsyncActionTypes, AsyncState, AsyncActionTypes } from '~/infra/redux/async2';
import viescoConfig from '~/modules/viescolaire/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

export interface ISlot {
  startHour: moment.Moment;
  endHour: moment.Moment;
  name: string;
}

export type ISlotList = ISlot[];

// THE STATE --------------------------------------------------------------------------------------

export type ITimeSlotsState = AsyncState<ISlotList>;

export const initialState: ISlotList = [];

export const getSlotsListState = (globalState: any) => viescoConfig.getState(globalState).cdt.timeSlots as ITimeSlotsState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes: AsyncActionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType('CDT_TIME_SLOTS'));
