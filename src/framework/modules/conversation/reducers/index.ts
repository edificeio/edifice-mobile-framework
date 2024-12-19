import { combineReducers } from 'redux';

import count from './count';
import init from './initMails';
import mailContent from './mailContent';
import mailList from './mailList';
import visibles from './visibles';

const rootReducer = combineReducers({
  count,
  init,
  mailContent,
  mailList,
  visibles,
});
export default rootReducer;
