import { combineReducers } from "redux";

import history from "./history";
import callList from "./teacherClassesCall";
import coursesRegister from "./teacherCourseRegister";
import coursesList from "./teacherCourses";

const combinedReducer = combineReducers({ coursesList, callList, coursesRegister, history });

export default combinedReducer;
