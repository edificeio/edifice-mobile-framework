import { combineReducers } from "redux"
import { Auth } from "./Auth"
import { Avatars } from "./Avatars"
import { Documents } from "./Documents"
import { Messages } from "./messages"
import navigation from "./navigation"
import threads from "./Thread"

export default combineReducers({
	auth: Auth,
	avatars: Avatars,
	documents: Documents,
	messages: Messages,
	navigation,
	threads,
})
