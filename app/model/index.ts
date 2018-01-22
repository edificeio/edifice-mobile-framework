import { combineReducers } from "redux"
import { Auth } from "./Auth"
import { Avatars } from "./Avatars"
import { conversations } from "./Conversation"
import { Documents } from "./Documents"
import { Messages } from "./messages"

export default combineReducers({
	auth: Auth,
	avatars: Avatars,
	conversations,
	documents: Documents,
	messages: Messages,
})
