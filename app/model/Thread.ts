import { PATH_CONVERSATION, PATH_NEW_MESSAGES, PATH_PREVIOUS_MESSAGES } from "../constants/paths"
import { crudReducer } from "./docs"

export interface IThreadModel {
	body: string
	cc: string[]
	ccName: string
	conversation: string
	date: number
	displayNames: string[][]
	from: string
	fromName: string
	id: string
	nb: number
	parent_id: string
	subject: string
	to: string[]
	toName: string
	unread: boolean
}

export interface IThreadState {
	payload: IThreadModel[]
	filter: null
	synced: boolean
}

const initialState: IThreadState = {
	payload: [],
	filter: null,
	synced: true,
}

export default (state: IThreadState = initialState, action): IThreadState => {
	if (action.type === "FILTER" && action.storeName === "conversations") {
		return action.value === null ? { ...state, filter: undefined } : { ...state, filter: action.value }
	}
	return crudReducer(state, [PATH_CONVERSATION, PATH_PREVIOUS_MESSAGES, PATH_NEW_MESSAGES], action)
}
