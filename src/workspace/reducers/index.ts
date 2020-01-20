import { combineReducers } from "redux";
import items from "./items";
import selected from "./select";
import copy from "./copypast";

const rootReducer = combineReducers<any>({
  items,
  selected,
  copy,
});

export default rootReducer;
