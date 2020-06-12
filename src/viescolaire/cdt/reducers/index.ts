
import homeworksList from "./homeworks";
import sessionsList from "./sessions";
import { combineReducers } from "redux";

const combinedReducer = combineReducers({ homeworksList, sessionsList });

export default combinedReducer;