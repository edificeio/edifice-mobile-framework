import { combineReducers } from "redux";
import { AsyncState } from "../../../redux/async";

import notifTypes, { INotificationType } from "./notifTypes";

export default combineReducers({
  notifTypes
});

export interface ITimelineState {
  notifTypes: AsyncState<INotificationType[]>;
}
