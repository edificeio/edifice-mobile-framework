import { combineReducers } from "redux";

import events from "./events";
import callList from "./teacherClassesCall";
import coursesList from "./teacherCourses";
import coursesRegister from "./teacherCoursesRegister";

const combinedReducer = combineReducers({ coursesList, callList, events, coursesRegister });

export default combinedReducer;
