/*
  Reducers for Pronote app.
*/
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';

import moduleConfig from '../moduleConfig';
import carnetDeBord from './carnetDeBord/reducer';

const reducer = combineReducers({
  carnetDeBord,
});

Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
