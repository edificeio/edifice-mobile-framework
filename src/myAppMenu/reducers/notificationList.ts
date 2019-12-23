/**
 * Notification list state reducer
 * Holds a list of available notifications in a simple Array
 */

import { initialState } from "../state/notificationList";
import { actionTypes } from "../state/notificationList";
import { createSessionAsyncReducer } from "../../infra/redux/async2";

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, actionTypes);
