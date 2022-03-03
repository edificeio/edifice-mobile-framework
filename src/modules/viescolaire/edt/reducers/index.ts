import { combineReducers } from 'redux';

import edtCourseList from './edtCourses';
import slotsList from './slots';
import userChildren from './userChildren';

export default combineReducers({ slotsList, userChildren, edtCourseList });
