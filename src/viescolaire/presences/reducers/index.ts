import { combineReducers } from "redux";

import history from "./history";
import callList from "./teacherClassesCall";
import coursesList from "./teacherCourses";
import coursesRegister from "./teacherCoursesRegister";

const combinedReducer = combineReducers({ coursesList, callList, coursesRegister, history });

export default combinedReducer;
