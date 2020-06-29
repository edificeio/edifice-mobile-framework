import { createAsyncActionTypes, AsyncState } from "../../../infra/redux/async2";
import viescoConfig from "../../config";

export type IEvent = {
  id?: number;
  start_date?: string;
  end_date?: string;
  comment?: string;
  counsellor_input?: string;
  student_id: string;
  register_id: number;
  type_id: number;
  reason_id?: number;
};

export type IEventsList = {
  [register_id: number]: {
    [event_id: number]: IEvent;
  }
};

export type IEventsListState = AsyncState<IEventsList>;

export const initialState: IEventsList = {};

export const getClassesCallListState = (globalState: any) =>
  viescoConfig.getLocalState(globalState).presences.callList as IEventsListState;

export const actionTypes = createAsyncActionTypes(viescoConfig.createActionType("CALL_EVENT"));
