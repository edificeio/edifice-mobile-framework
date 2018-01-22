import {crudReducer} from "./docs";
import {PATH_CONVERSATION} from "../constants/paths";

export interface ConversationModel {
	id: string
	subject: string
	body: string
	date: number
	displayNames: string[][]
	nb: number
}

export interface ConversationState {
	payload: ConversationModel[]
	filter: null
	synced: boolean
}

const initialState : ConversationState = {
    payload: [],
    filter: null,
    synced: true,
}

export const conversations = (state: ConversationState = initialState, action): ConversationState => {

	if (action.type === "FILTER" && action.storeName === "conversations") {
		return action.value === null ? { ...state, filter: undefined } : { ...state, filter: action.value }
	}
    return crudReducer(state, [PATH_CONVERSATION], action)
}
