import { PATH_CONVERSATION, PATH_NEW_MESSAGES, PATH_PREVIOUS_MESSAGES } from "../constants/paths"
import { crudReducer } from "./docs"
import {ACTION_MODE} from "../actions/docs";

export enum ThreadStatus {
	sent,
	sending,
	failed,
}

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
	status: ThreadStatus
	lastOfConversation: IThreadModel
}

export interface IThreadState {
	mode: ACTION_MODE
	pageNumber: number
	payload: IThreadModel[]
	filterCriteria: null
	synced: boolean
	processing: IThreadModel[]
}

const initialState: IThreadState = {
	mode: ACTION_MODE.replace,
	pageNumber: 0,
	payload: [],
	filterCriteria: null,
	synced: true,
	processing: [],
}

export default (state: IThreadState = initialState, action): IThreadState => {
	if (action.type === "CONVERSATION_SEND") {
		action.data.status = ThreadStatus.sending;
		return {
			...state,
			processing: [...state.processing, ...[action.data]],
		}
	}
	if (action.type === "CONVERSATION_SENT") {
		const index = state.processing.indexOf(state.processing.find(p => p.id === action.data.id));
		return {
			...state,
			processing: state.processing.filter((e, i) => i !== index),
			payload: [...state.payload, ...[{
				 ...action.data,
				 id: action.data.newId
			}]]
		}
	}
	if (action.type === "CONVERSATION_FAILED_SEND") {
		const data = state.processing.find(p => p.id === action.data.id);
		data.status = ThreadStatus.failed;
		return {
			...state,
		}
	}

	if (action.type === "FILTER" && action.path === PATH_CONVERSATION) {
		return action.value === null ? { ...state, filterCriteria: null } : { ...state, filterCriteria: action.value }
	}

	return {
		...crudReducer(state, [PATH_CONVERSATION, PATH_PREVIOUS_MESSAGES, PATH_NEW_MESSAGES], action),
		processing: [],
	}
}
