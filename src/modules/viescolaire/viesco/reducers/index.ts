import { combineReducers } from "redux";

import children from "./children";
import childrenGroups from "./childrenGroups";
import group from "./group";
import multipleSlots from "./multipleSlots";
import { periods, year } from "./periods";
import personnelList from "./personnel";
import registerPreferences from "./registerPreferences";
import structure from "./structure";
import subjectsList from "./subjects";

export default combineReducers({
  subjectsList,
  personnelList,
  children,
  structure,
  periods,
  year,
  group,
  childrenGroups,
  multipleSlots,
  registerPreferences,
});
