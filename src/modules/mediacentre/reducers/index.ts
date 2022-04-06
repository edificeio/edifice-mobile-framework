import { combineReducers } from 'redux';

import favorites from './favorites';
import garResources from './garResources';
import search from './search';
import signets from './signets';
import textbooks from './textbooks';

const rootReducer = combineReducers({ favorites, garResources, search, signets, textbooks });
export default rootReducer;
