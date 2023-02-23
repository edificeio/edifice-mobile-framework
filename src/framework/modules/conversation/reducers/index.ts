import { combineReducers } from 'redux';

import count from './count';
import init from './initMails';
import mailContent from './mailContent';
import mailList from './mailList';
import visibles from './visibles';

const rootReducer = combineReducers({
  init,
  count,
  mailList,
  mailContent,
  visibles,
});
export default rootReducer;
