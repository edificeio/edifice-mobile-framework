import { combineReducers } from 'redux';

import children from './children';
import childrenGroups from './childrenGroups';
import coursesList from './courses';
import group from './group';
import { periods, year } from './periods';
import personnelList from './personnel';
import structure from './structure';
import subjectsList from './subjects';

export default combineReducers({
  subjectsList,
  personnelList,
  children,
  structure,
  periods,
  year,
  group,
  childrenGroups,
  coursesList,
});
