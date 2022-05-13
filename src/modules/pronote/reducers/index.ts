/*
  Reducers for Pronote app.
*/
import { combineReducers } from "redux";



import connector from "./connector";
import carnetDeBord from "../state/carnetDeBord/reducer"

export default combineReducers({
  connector,
  carnetDeBord
});
