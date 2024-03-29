/*
  Reducers for Pronote app.
*/
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import moduleConfig from '~/framework/modules/pronote/module-config';

import carnetDeBord from './carnet-de-bord';

const reducer = combineReducers({
  carnetDeBord,
});

Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
