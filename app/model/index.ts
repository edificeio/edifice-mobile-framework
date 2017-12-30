import { combineReducers } from "redux"
import { Auth } from "./Auth"
import { Conversation } from "./Conversation"
import { Documents } from "./Documents"
import { Messages } from "./messages"

export default combineReducers({
	auth: Auth,
	inbox: Conversation,
	documents: Documents,
	messages: Messages,
})
