import { AsyncState, createAsyncActionCreators, createAsyncActionTypes, createSessionAsyncReducer } from "../../../../redux/async";
import moduleConfig from "../../moduleConfig";

// State

export interface INotifFilterSettings { [type: string]: boolean; }

export type INotifFilterSettings_State = AsyncState<INotifFilterSettings>;

// Reducer

const initialState: INotifFilterSettings = {};

export const actionTypes = createAsyncActionTypes(moduleConfig.namespaceActionType("NOTIFICATION_SETTINGS"));
export const actions = createAsyncActionCreators<INotifFilterSettings>(actionTypes);

export default createSessionAsyncReducer(initialState, actionTypes);

// Getters


