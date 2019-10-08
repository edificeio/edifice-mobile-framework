import { combineReducers } from "redux";
import documents from "./documents";
import folders from "./folders";

const rootReducer = combineReducers({
  folders,
  documents
});

export default rootReducer;
