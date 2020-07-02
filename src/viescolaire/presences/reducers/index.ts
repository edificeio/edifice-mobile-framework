import { combineReducers } from "redux";

import callList from "./teacherClassesCall";
import coursesList from "./teacherCourses";
import coursesRegister from "./teacherCoursesRegister";

const combinedReducer = combineReducers({ coursesList, callList, coursesRegister });

export default combinedReducer;
