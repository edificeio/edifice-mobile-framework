import { combineReducers } from "redux"
import { Auth } from "./Auth";
import { Timeline } from './Timeline';
import conversation from "./conversation";

export default combineReducers({
	auth: Auth,
	conversation: conversation,
	timeline: Timeline
});
