import { combineReducers } from "redux";

import devoirsList from "./devoirs";
import moyennesList from "./moyennes";

const combinedReducer = combineReducers({ devoirsList, moyennesList });

export default combinedReducer;
