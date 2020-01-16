import { combineReducers } from "redux";
import items from "./items";
import selected from "./select";

const rootReducer = combineReducers<any>({
  items,
  selected,
});

export default rootReducer;
