import { combineReducers } from "redux";
import { AsyncState } from "../../../redux/async";

import notifTypes, { INotifTypesState } from "./notifTypes";

export default combineReducers({
  notifTypes
});

export interface ITimelineState {
  notifTypes: AsyncState<INotifTypesState>;
}
