import { combineReducers } from 'redux';

import externals from './externals';
import favorites from './favorites';
import search from './search';
import signets from './signets';
import textbooks from './textbooks';

const rootReducer = combineReducers({ externals, favorites, search, signets, textbooks });
export default rootReducer;
