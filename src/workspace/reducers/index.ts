import { combineReducers } from "redux";
import workspace from "./entities";
import {IStateWorkspace} from "../types/entity";

const rootReducer = combineReducers<IStateWorkspace>({
  workspace,
});

export default rootReducer;
