import { Conf } from "../Conf";
import { Me } from "../infra/Me";
import { PATH_CREATE_CONVERSATION, PATH_NEW_MESSAGES, replace1 } from "../constants/paths"
import {create, read, readCheck, readNext} from "./docs"
import { Message, IThreadModel } from '../model/Thread';
import { Tracking } from '../tracking/TrackingManager';

export const createConversation = payload => create(PATH_CREATE_CONVERSATION, payload, false);

console.log(Conf);

export const readThread = dispatch => async (threadId: string) => {
	try{
		const response = await fetch(`${ Conf.platform }/conversation/thread/messages/${threadId}`);
		const messages = await response.json();

		for(let message of messages){
			if(!message.unread){
				continue;
			}
			message.unread = false;
			fetch(`${Conf.platform}/conversation/message/${message.id}`);
		}

		Tracking.logEvent('readConversation', {
			application: 'conversation'
		});

		dispatch({
			type: 'READ_THREAD_CONVERSATION',
			messages: messages,
			threadId: threadId
		});
	}
	catch(e){
		console.log(e);
	}
}

export const clearConversation = dispatch => () => {
	dispatch({
		type: "CLEAR_CONVERSATION"
	});
}

export const readNextConversation = dispatch => async page => {
	dispatch({
		type: "READ_NEXT_CONVERSATION"
	});

	console.log(`${Conf.platform}/conversation/threads/list?page=${page}`);
	const response = await fetch(`${Conf.platform}/conversation/threads/list?page=${page}`)

	try {
		const threads = await response.json();

		dispatch({
			type: "APPEND_NEXT_CONVERSATION",
			threads: threads,
		})
	} catch (e) {
		console.log(e)
		dispatch({
			type: "END_REACHED_CONVERSATION",
		})
	}
}

export const deleteThread = dispatch => async (conversation: IThreadModel) => {
	dispatch({
		type: "DELETE_THREAD_CONVERSATION",
		data: { conversationId: conversation.id },
	})

	try {
		const response = await fetch(`${Conf.platform}/conversation/thread/previous-messages/${conversation.id}`);
		let json = await response.json();

		for(let i = 0; i < conversation.messages.length; i++){
			fetch(`${Conf.platform}/conversation/trash?id=${conversation.messages[i].id}`, { method: 'put' }).then(r => console.log(r)).catch(e => console.log(e));
		}

		for(let i = 0; i < json.length; i++){
			fetch(`${Conf.platform}/conversation/trash?id=${json[i].id}`, { method: 'put' }).then(r => console.log(r)).catch(e => console.log(e));
		}
	} catch (e) {
		console.log(e);
	}
}

export const sendMessage = dispatch => async (data: Message) => {
	data.id = Math.random().toString();
	dispatch({
		type: "CONVERSATION_SEND",
		data: { ...data, conversation: data.parentId, from: Me.session.userId },
	})

	try {
		const response = await fetch(`${Conf.platform}/conversation/send?In-Reply-To=${data.parentId}`, {
			method: "post",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				body: data.body,
				to: data.to,
				cc: data.cc,
				subject: data.subject,
			}),
		})
		let json = await response.json();
		data.newId = json.id;
		data.date = Date.now();

		Tracking.logEvent('sentMessage', {
			application: 'conversation',
			length: data.body.length - 9
		});

		dispatch({
			type: "CONVERSATION_SENT",
			data: { ...data, conversation: data.parentId, from: Me.session.userId, thread_id: data.thread_id },
		});
	} catch (e) {
		console.log(e)
		dispatch({
			type: "CONVERSATION_FAILED_SEND",
			data: data,
		})
	}
}
