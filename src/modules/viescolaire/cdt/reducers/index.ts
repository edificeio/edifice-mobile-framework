import { combineReducers } from "redux";

import homeworksList from "./homeworks";
import sessionsList from "./sessions";

const combinedReducer = combineReducers({ homeworksList, sessionsList });

export default combinedReducer;
