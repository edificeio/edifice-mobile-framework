import { combineReducers } from "redux"
import { Auth } from "./Auth"
import { News } from "./News"
import { Messages } from "./messages"
import { Timeline } from './Timeline';

import threads from "./Thread"

export default combineReducers({
	auth: Auth,
	documents: News,
	messages: Messages,
	news: News,
	threads,
	timeline: Timeline
});
