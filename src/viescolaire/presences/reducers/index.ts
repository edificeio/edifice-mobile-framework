import { combineReducers } from "redux";

import callList from "./teacherClassesCall";
import coursesList from "./teacherCourses";

const combinedReducer = combineReducers({ coursesList, callList });

export default combinedReducer;
