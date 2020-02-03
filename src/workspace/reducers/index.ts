import { combineReducers } from "redux";
import contentUri from "./contentUri";
import folders from "./folders";
import items from "./items";
import selected from "./select";

const rootReducer = combineReducers<any>({
  contentUri,
  folders,
  items,
  selected,
});

export default rootReducer;
