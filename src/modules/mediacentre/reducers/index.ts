import { combineReducers } from 'redux';

import favorites from './favorites';
import search from './search';
import signets from './signets';
import textbooks from './textbooks';

const rootReducer = combineReducers({ favorites, search, signets, textbooks });
export default rootReducer;
