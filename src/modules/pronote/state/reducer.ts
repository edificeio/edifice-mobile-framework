/*
  Reducers for Pronote app.
*/
import { combineReducers } from 'redux';

import carnetDeBord from './carnetDeBord/reducer';

export default combineReducers({
  carnetDeBord,
});
