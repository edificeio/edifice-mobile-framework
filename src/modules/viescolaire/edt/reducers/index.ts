import { combineReducers } from 'redux';

import slotsList from './slots';
import userChildren from './userChildren';

export default combineReducers({ slotsList, userChildren });
