import { PATH_CONVERSATION, PATH_NEW_MESSAGES, PATH_PREVIOUS_MESSAGES } from "../constants/paths"
import { crudReducer } from "./docs"

export enum ThreadStatus{
	sent, sending, failed
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
	status:ThreadStatus
}

export interface IThreadState {
	payload: IThreadModel[];
	filterCriteria: null;
	synced: boolean;
	processing: IThreadModel[]
}

const initialState: IThreadState = {
	payload: [],
	filterCriteria: null,
	synced: true,
	processing: []
}

export default (state: IThreadState = initialState, action): IThreadState => {
	
	if(action.type === 'CONVERSATION_SEND'){
		action.data.status = ThreadStatus.sending;
		action.data.id = `p${state.processing.length}`;
		return {
			...state,
			processing: [...state.processing, ...[action.data]]
		};
	}
	if(action.type === 'CONVERSATION_SENT'){
		const index = state.processing.indexOf(state.processing.find(p => p.id === action.data.id));
		return {
			...state,
			processing: state.processing.filter((e, i) => i !== index)
		};
	}
	if(action.type === 'CONVERSATION_FAILED_SEND'){
		const data = state.processing.find(p => p.id === action.data.id);
		data.status = ThreadStatus.failed;
		return {
			...state
		};
	}
	
	if (action.type === "FILTER" && action.path === PATH_CONVERSATION) {
		return action.value === null ? { ...state, filterCriteria: null } : { ...state, filterCriteria: action.value }
	}

	return { ...crudReducer(state, [PATH_CONVERSATION, PATH_PREVIOUS_MESSAGES, PATH_NEW_MESSAGES], action), processing: [] }
}