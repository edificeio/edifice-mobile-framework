/*
  Reducers for User app and authentification.
*/
import { Action, combineReducers } from 'redux';

import activation from './activation';
import auth from './auth';
import changePassword from './changePassword';
import forgot from './forgot';
import info from './info';
import xmas from './xmas';

const rootReducer: (state: any, action: Action) => any = combineReducers({
  auth,
  info,
  activation,
  forgot,
  changePassword,
  xmas,
});

export default rootReducer;

// LEGACY EXPORTS : used in conversations app
export interface IUser {
  userId: string;
  displayName: string;
}
export interface IGroup {
  id: string;
  name: string;
}
