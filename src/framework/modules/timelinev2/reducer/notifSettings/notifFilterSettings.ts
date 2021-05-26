import { Action } from "redux";
import { AsyncState, createAsyncActionCreators, createAsyncActionTypes, createSessionAsyncReducer } from "../../../../redux/async";
import moduleConfig from "../../moduleConfig";

// State

export interface INotifFilterSettings { [type: string]: boolean; }

export type INotifFilterSettings_State = AsyncState<INotifFilterSettings>;

// Reducer

const initialState: INotifFilterSettings = {};

export const actionTypes = {
    ...createAsyncActionTypes(moduleConfig.namespaceActionType("NOTIFICATION_SETTINGS")),
    put: moduleConfig.namespaceActionType("NOTIFICATION_SETTINGS_UPDATED")
};
export const actions = {
    ...createAsyncActionCreators<INotifFilterSettings>(actionTypes),
    put: (data: INotifFilterSettings) => ({ type: actionTypes.put, data })
};

export default createSessionAsyncReducer(initialState, actionTypes, {
    [actionTypes.put]: (s, a) => {
        const action = a as Action & { data: INotifFilterSettings };
        return { ...s, ...a.data };
    }
});

// Getters
