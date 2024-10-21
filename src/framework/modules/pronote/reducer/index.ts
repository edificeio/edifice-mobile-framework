/*
  Reducers for Pronote app.
*/
import { combineReducers } from 'redux';

import carnetDeBord from './carnet-de-bord';

import { Reducers } from '~/app/store';
import moduleConfig from '~/framework/modules/pronote/module-config';

const reducer = combineReducers({
  carnetDeBord,
});

Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
