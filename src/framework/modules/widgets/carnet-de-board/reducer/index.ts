/*
  Reducers for Pronote app.
*/
import { combineReducers } from 'redux';

import carnetDeBord from './carnet-de-bord';

const reducer = combineReducers({
  carnetDeBord,
});

export default reducer;
