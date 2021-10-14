import { combineReducers } from "redux";

import levels from "./competencesLevels";
import devoirsMatieres from "./devoirs";
import matieres from "./matieres";
import moyennesList from "./moyennes";
import serviceList from "./servicesMatieres";
import structureMatiereList from "./structureMatieres";

const combinedReducer = combineReducers({
  devoirsMatieres,
  moyennesList,
  levels,
  matieres,
  serviceList,
  structureMatiereList,
});

export default combinedReducer;
