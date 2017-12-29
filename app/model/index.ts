import { combineReducers } from "redux"
import { Auth } from "./Auth"
import { Conversation } from "./Conversation"
import { Documents } from "./Documents"
import { Navigation } from "./navigation"
import { Messages } from "./messages"

export default combineReducers({
	auth: Auth,
	inbox: Conversation,
	documents: Documents,
	navigation: Navigation,
	messages: Messages,
})
