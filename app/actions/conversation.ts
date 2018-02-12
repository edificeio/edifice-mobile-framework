import { Conf } from "../Conf";
import { Me } from "../infra/Me";
import { PATH_CREATE_CONVERSATION, PATH_NEW_MESSAGES, replace1 } from "../constants/paths";
import { Message, IThreadModel } from '../model/conversation';
import { Tracking } from '../tracking/TrackingManager';
import { read } from "../infra/Cache";
import { takePhoto, uploadImage } from './workspace';

console.log(Conf);

export const fetchThread = dispatch => async (threadId: string) => {
	try{
		const messages = await read(`/conversation/thread/messages/${threadId}`);

		for(let message of messages){
			if(!message.unread){
				continue;
			}
			message.unread = false;
			fetch(`${Conf.platform}/conversation/message/${message.id}`);
		}

		Tracking.logEvent('refreshConversation', {
			application: 'conversation'
		});

		dispatch({
			type: 'FETCH_THREAD_CONVERSATION',
			messages: messages,
			threadId: threadId
		});
	}
	catch(e){
		console.log(e);
	}
}

export const clearFilterConversation = dispatch => () => {
	dispatch({
		type: 'CLEAR_FILTER_CONVERSATION'
	})
};

export const readThread = dispatch => async (threadId: string) => {
	try{
		const messages = await read(`/conversation/thread/messages/${threadId}`);

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

export const sendPhoto = dispatch => async (data: { subject: string, to: any[], cc:any[], parentId?: string, body?: string }, userId) => {
	const uri = await takePhoto();
	
	dispatch({
		type: 'CONVERSATION_SEND',
		data: { ...data, conversation: data.parentId, from: userId, body: `<div><img src="${uri}" /></div>` }
	});

	try{
		const documentPath = await uploadImage(uri);
		const response = await fetch(`${ Conf.platform }/conversation/send?In-Reply-To=${data.parentId}`, {
			method: 'post',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				body: `<div><img src="${documentPath}" /></div>`,
				to: data.to,
				cc: data.cc,
				subject: data.subject
			})
		});
		let json = await response.json();

		dispatch({
			type: 'CONVERSATION_SENT',
			data: data
		});
	}
	catch(e){
		console.log(e);
		dispatch({
			type: 'CONVERSATION_FAILED_SEND',
			data: data
		});
	}
}

export const clearConversation = dispatch => () => {
	dispatch({
		type: "CLEAR_CONVERSATION"
	});
}

export const fetchConversation = dispatch => async () => {
	dispatch({
		type: "FETCH_CONVERSATION"
	});

	console.log(`${Conf.platform}/conversation/threads/list?page=0`);
	try {
		const threads = await read(`/conversation/threads/list?page=0`);
		dispatch({
			type: "FETCH_NEW_CONVERSATION",
			threads: threads
		})
	} catch (e) {
		console.log(e);
	}
}

export const readNextConversation = dispatch => async page => {
	dispatch({
		type: "READ_NEXT_CONVERSATION"
	});

	console.log(`${Conf.platform}/conversation/threads/list?page=${page}`);
	try {
		const threads = await read(`/conversation/threads/list?page=${page}`);
		dispatch({
			type: "APPEND_NEXT_CONVERSATION",
			threads: threads,
			page: page + 1
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
		data: { 
			...data, 
			conversation: data.parentId, 
			from: Me.session.userId,
			date: Date.now()
		},
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

		Tracking.logEvent('sentMessage', {
			application: 'conversation',
			length: data.body.length - 9
		});

		dispatch({
			type: "CONVERSATION_SENT",
			data: { 
				...data, 
				conversation: data.parentId, 
				from: Me.session.userId, 
				thread_id: data.thread_id,
				date: Date.now(),
				newId: json.id
			},
		});
	} catch (e) {
		console.log(e)
		dispatch({
			type: "CONVERSATION_FAILED_SEND",
			data: { 
				...data, 
				conversation: data.parentId, 
				from: Me.session.userId, 
				thread_id: data.thread_id ,
				date: Date.now()
			},
		})
	}
}
