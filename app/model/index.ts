import { combineReducers } from "redux"
import { Auth } from "./Auth";
import { Timeline } from './Timeline';
import conversation from "./conversation"
import connectionTracker from "./connectionTracker";
import ui from './ui';

export default combineReducers({
	auth: Auth,
	conversation: conversation,
	timeline: Timeline,
	connectionTracker: connectionTracker,
	ui: ui
});
