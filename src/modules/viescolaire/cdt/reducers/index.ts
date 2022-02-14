import { combineReducers } from 'redux';

import homeworksList from './homeworks';
import sessionsList from './sessions';
import timeSlots from './timeSlots';

const combinedReducer = combineReducers({ homeworksList, sessionsList, timeSlots });

export default combinedReducer;
