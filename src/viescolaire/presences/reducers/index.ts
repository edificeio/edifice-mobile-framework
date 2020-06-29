import { combineReducers } from "redux";

import events from "./events";
import callList from "./teacherClassesCall";
import coursesList from "./teacherCourses";

const combinedReducer = combineReducers({ coursesList, callList, events });

export default combinedReducer;
