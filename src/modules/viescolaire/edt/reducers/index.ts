import { combineReducers } from "redux";

import coursesList from "./courses";
import slotsList from "./slots";

export default combineReducers({ coursesList, slotsList });
