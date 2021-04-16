import { combineReducers } from "redux";

import devoirsList from "./devoirs";
import moyennesList from "./moyennes";
import levels from "./competencesLevels";

const combinedReducer = combineReducers({ devoirsList, moyennesList, levels });

export default combinedReducer;
