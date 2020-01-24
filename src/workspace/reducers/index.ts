import { combineReducers } from "redux";
import items from "./items";
import selected from "./select";
import copy from "./copypast";
import contentUri from "./contentUri";

const rootReducer = combineReducers<any>({
  items,
  selected,
  contentUri,
  copy,
});

export default rootReducer;
