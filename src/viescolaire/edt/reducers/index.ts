import { combineReducers } from "redux";

import coursesList from "./courses";
import slotsList from "./slots";
import userChildren from "./userChildren";

export default combineReducers({ coursesList, slotsList, userChildren });
