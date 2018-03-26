import { PATH_CONVERSATION, PATH_NEW_MESSAGES, PATH_PREVIOUS_MESSAGES } from "../constants/paths"
import { crudReducer } from "./docs"
import {ACTION_MODE} from "../actions/docs";
import { Me } from '../infra/Me';

export enum MessageStatus {
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
	status: MessageStatus;
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
	page: number
	threads: IThreadModel[]
	filterCriteria: string
	synced: boolean
	processing: Message[];
	refresh: boolean;
	refreshThreads: boolean;
	filterCleared: boolean;
}

const initialState: IThreadState = {
	mode: ACTION_MODE.replace,
	page: 0,
	threads: [],
	filterCriteria: '',
	synced: true,
	processing: [],
	refresh: true,
	refreshThreads: false,
	filterCleared: false
}

export default (state: IThreadState = initialState, action): IThreadState => {
	if(action.type === 'CLEAR_CONVERSATION'){
		return {
			...state,
			processing: [],
			threads: []
		}
	}
	if(action.type === 'CLEAR_FILTER_CONVERSATION'){
		return {
			...state,
			filterCleared: true,
			filterCriteria: ''
		}
	}
	if(action.type === 'READ_NEXT_CONVERSATION'){
		return {
			...state,
			refresh: false,
			filterCleared: false
		}
	}
	if(action.type === 'INVALIDATE_CONVERSATION'){
		return {
			...state,
			processing: [],
			refresh: true,
			refreshThreads: true,
			filterCleared: false
		}
	}
	if(action.type === 'READ_THREAD_CONVERSATION'){
		const parentThread = state.threads.find(t => t.thread_id === action.threadId);
		const newParentThread = {
			...parentThread,
			nb: 0,
			messages: action.messages
		};
		return {
			...state,
			processing: [],
			threads: [
				...state.threads.filter(t => t.thread_id !== action.threadId), newParentThread
			].sort((a, b) => b.date - a.date),
			refreshThreads: false,
			filterCleared: false
		}
	}
	if(action.type === 'FETCH_THREAD_CONVERSATION'){
		const parentThread = state.threads.find(t => t.thread_id === action.threadId);
		const newParentThread = {
			...parentThread,
			nb: 0,
			messages: action.messages
		};
		return {
			...state,
			processing: [],
			threads: [
				...state.threads.filter(t => t.thread_id !== action.threadId), newParentThread
			].sort((a, b) => b.date - a.date),
			refreshThreads: false,
			filterCleared: false
		}
	}
	if(action.type === 'APPEND_NEXT_CONVERSATION'){
		return {
			...state,
			page: action.page,
			threads: [...state.threads, ...action.threads
				.filter(c => state.threads.find(t => t.id === c[0].id || t.thread_id === c[0].thread_id) === undefined)
				.map(c => {
					const thread = { 
						...c[0],
						nb: c.filter(e => e.unread && e.from !== Me.session.userId).length,
						messages: [c[0]],
						subject: c[0].subject ? c[0].subject.replace(/Tr :|Re :|Re:|Tr:/g, '') : ''
					};
					return thread;
			})].sort((a, b) => b.date - a.date),
			filterCleared: false
		}
	}
	if(action.type === 'FETCH_NEW_CONVERSATION'){
		return {
			...state,
			threads: [...action.threads
				.filter(c => state.threads.find(t => t.id === c[0].id || t.thread_id === c[0].thread_id) === undefined)
				.map(c => {
					const thread = { 
						...c[0],
						nb: c.filter(e => e.unread && e.from !== Me.session.userId).length,
						messages: [...c],
						subject: c[0].subject ? c[0].subject.replace(/Tr :|Re :|Re:|Tr:/g, '') : ''
					};
					return thread;
			}), ...state.threads].sort((a, b) => b.date - a.date),
			filterCleared: false
		}
	}
	if (action.type === 'DELETE_THREAD_CONVERSATION'){
		return {
			...state,
			threads: [...state.threads.filter(t => t.id !== action.data.conversationId)],
			filterCleared: false
		}
	}
	if (action.type === "CONVERSATION_SEND") {
		action.data.status = MessageStatus.sending;
		return {
			...state,
			processing: [...state.processing, ...[action.data]],
			filterCleared: false
		}
	}
	if (action.type === "CONVERSATION_SENT") {
		const index = state.processing.indexOf(state.processing.find(p => p.id === action.data.id));
		const parentThread = state.threads.find(t => t.thread_id === action.data.thread_id);
		const newParentThread = {
			...parentThread,
			messages: [action.data, ...parentThread.messages],
			date: action.data.date,
			filterCleared: false
		};

		return {
			...state,
			processing: state.processing.filter((e, i) => i !== index),
			threads: [...state.threads.filter(p => p !== parentThread), newParentThread].sort((a, b) => b.date - a.date),
			filterCleared: false
		}
	}
	if (action.type === "CONVERSATION_FAILED_SEND") {
		const data = {
			...state.processing.find(p => p.id === action.data.id),
			status: MessageStatus.failed
		}
		const index = state.processing.indexOf(state.processing.find(p => p.id === action.data.id));
		const parentThread = state.threads.find(t => t.thread_id === action.data.thread_id);
		const newParentThread = {
			...parentThread,
			messages: [data, ...parentThread.messages]
		};

		return {
			...state,
			processing: state.processing.filter((e, i) => i !== index),
			threads: [...state.threads.filter(p => p !== parentThread), newParentThread].sort((a, b) => b.date - a.date),
			filterCleared: false
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
