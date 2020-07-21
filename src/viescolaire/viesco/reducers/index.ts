import { combineReducers } from "redux";

import children from "./children";
import { periods, year } from "./periods";
import personnelList from "./personnel";
import structure from "./structure";
import subjectsList from "./subjects";

export default combineReducers({ subjectsList, personnelList, children, structure, periods, year });
