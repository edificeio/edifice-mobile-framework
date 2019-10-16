import { combineReducers } from "redux";
import items from "./items";
import details from "./details";
import {IStateItems} from "../types";

const rootReducer = combineReducers<IStateItems>({
  details,
  items,
});

export default rootReducer;
