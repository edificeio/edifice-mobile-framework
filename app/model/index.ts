import { combineReducers } from "redux"
import { Auth } from "./Auth"
import { conversations } from "./Conversation"
import { Documents } from "./Documents"
import { Avatars } from "./Avatars"
import { Messages } from "./messages"

export default combineReducers({
	auth: Auth,
	avatars: Avatars,
	conversations: conversations,
	documents: Documents,
	messages: Messages,
})
