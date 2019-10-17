import { combineReducers } from "redux";
import items from "./items";
import {IState} from "../types";

const rootReducer = combineReducers<IState>({
  items,
});

export default rootReducer;
