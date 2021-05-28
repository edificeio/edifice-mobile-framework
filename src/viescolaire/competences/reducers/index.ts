import { combineReducers } from "redux";

import levels from "./competencesLevels";
import devoirsList from "./devoirs";
import matieres from "./matieres";
import moyennesList from "./moyennes";

const combinedReducer = combineReducers({ devoirsList, moyennesList, levels, matieres });

export default combinedReducer;
