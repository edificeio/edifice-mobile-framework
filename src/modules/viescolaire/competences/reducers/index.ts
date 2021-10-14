import { combineReducers } from "redux";

import levels from "./competencesLevels";
import devoirsMatieres from "./devoirs";;
import moyennesList from "./moyennes";

const combinedReducer = combineReducers({
  devoirsMatieres,
  moyennesList,
  levels,
});

export default combinedReducer;
