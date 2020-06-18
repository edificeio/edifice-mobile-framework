import subjectsList from "./subjects";
import personnelList from "./personnel";
import children from "./children";
import { combineReducers } from "redux";

export default combineReducers({ subjectsList, personnelList, children });
