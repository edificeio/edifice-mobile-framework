import { PATH_CONVERSATION, PATH_NEW_MESSAGES, PATH_PREVIOUS_MESSAGES } from "../constants/paths"
import { crudReducer } from "./docs"
import {ACTION_MODE} from "../actions/docs";
import { Me } from '../infra/Me';

export enum ThreadStatus {
	sent,
	sending,
	failed,
}

export interface Message{
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
	status: ThreadStatus;
	userId: string;
	parentId: string;
	thread_id: string;
	newId: string;
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
	messages: Message[];
	thread_id: string;
}

export interface IThreadState {
	mode: ACTION_MODE
	pageNumber: number
	payload: IThreadModel[]
	filterCriteria: null
	synced: boolean
	processing: Message[]
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
	if(action.type === 'CLEAR_CONVERSATION'){
		return {
			...state,
			processing: [],
			payload: []
		}
	}
	if(action.type === 'READ_THREAD_CONVERSATION'){
		const parentThread = state.payload.find(t => t.thread_id === action.threadId);
		const newParentThread = {
			...parentThread,
			nb: 0,
			messages: action.messages
		};
		return {
			...state,
			processing: [],
			payload: [
				...state.payload.filter(t => t.thread_id !== action.threadId), newParentThread
			].sort((a, b) => b.date - a.date)
		}
	}
	if(action.type === 'APPEND_NEXT_CONVERSATION'){
		return {
			...state,
			payload: [...state.payload, ...action.threads
				.filter(c => state.payload.find(t => t.id === c[0].id || t.thread_id === c[0].thread_id) === undefined)
				.map(c => {
					const thread = { ...c[0] };
					thread.nb = c.filter(e => e.unread && e.from !== Me.session.userId).length;
					thread.messages = c;
					if(thread.subject){
						thread.subject = thread.subject.replace(/Tr :|Re :|Re:|Tr:/g, '');
					}
					return thread;
			})].sort((a, b) => b.date - a.date)
		}
	}
	if (action.type.indexOf("_SUCCESS") > 0 && action.path.indexOf('conversation/threads/list') !== -1) {
		return {
			...state,
			payload: [...state.payload, ...action.payload
				.filter(c => state.payload.find(t => t.id === c[0].id || t.thread_id === c[0].thread_id) === undefined)
				.map(c => {
					const thread = { ...c[0] };
					thread.nb = c.filter(e => e.unread && e.from !== Me.session.userId).length;
					thread.messages = c;
					if(thread.subject){
						thread.subject = thread.subject.replace(/Tr :|Re :/g, '');
					}
					return thread;
			})].sort((a, b) => b.date - a.date)
		}
	}
	if (action.type === 'DELETE_THREAD_CONVERSATION'){
		return {
			...state,
			payload: [...state.payload.filter(t => t.id !== action.data.conversationId)]
		}
	}
	if (action.type === "CONVERSATION_SEND") {
		action.data.status = ThreadStatus.sending;
		return {
			...state,
			processing: [...state.processing, ...[action.data]],
		}
	}
	if (action.type === "CONVERSATION_SENT") {
		const index = state.processing.indexOf(state.processing.find(p => p.id === action.data.id));
		const parentThread = state.payload.find(t => t.thread_id === action.data.thread_id);
		const newParentThread = {
			...parentThread,
			messages: [action.data, ...parentThread.messages],
			date: action.data.date
		};

		return {
			...state,
			processing: state.processing.filter((e, i) => i !== index),
			payload: [...state.payload.filter(p => p !== parentThread), newParentThread].sort((a, b) => b.date - a.date)
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
