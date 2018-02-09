import { combineReducers } from "redux"
import { Auth } from "./Auth"
import { News } from "./News"
import { Messages } from "./messages"
import threads from "./Thread"

export default combineReducers({
	auth: Auth,
	messages: Messages,
	news: News,
	threads,
})
