import { combineReducers } from "redux"
import { Auth } from "./Auth"
import { Messages } from "./messages"
import { Timeline } from './Timeline';

import threads from "./Thread"

export default combineReducers({
	auth: Auth,
	messages: Messages,
	threads,
	timeline: Timeline
});
