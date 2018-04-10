import { combineReducers } from "redux"
import { Timeline } from './Timeline';
import auth from "../auth/reducer"
import conversation from "../conversation/reducer"
import connectionTracker from "./connectionTracker";
import ui from './ui';

export default combineReducers({
	auth: auth,
	conversation: conversation,
	timeline: Timeline,
	connectionTracker: connectionTracker,
	ui: ui
});
