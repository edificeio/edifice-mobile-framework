import { combineReducers } from 'redux';

import levels from './competencesLevels';
import devoirsMatieres from './devoirs';
import moyennesList from './moyennes';
import userChildren from './userChildren';

const combinedReducer = combineReducers({
  devoirsMatieres,
  moyennesList,
  levels,
  userChildren,
});

export default combinedReducer;
