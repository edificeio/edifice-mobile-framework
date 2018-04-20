import { Conf } from "../../Conf";
import { Tracking } from "../../tracking/TrackingManager";
import { read } from "../../infra/Cache";
import { Thread } from "../interfaces";
import { Me } from "../../infra/Me";

export const fetchThread = dispatch => async (threadId: string) => {
	try{
		const messages = await read(`/conversation/thread/messages/${threadId}`);

		for(let message of messages){
			if(!message.unread){
				continue;
			}
			
			fetch(`${Conf.platform}/conversation/message/${message.id}`);
		}

		Tracking.logEvent('refreshConversation');

		dispatch({
			type: 'FETCH_THREAD_CONVERSATION',
			messages: messages.map(m => ({ ...m, unread: false })),
			threadId: threadId
		});
	}
	catch(e){
		console.log(e);
	}
}

export const readThread = dispatch => async (threadId: string) => {
	try{
		const messages = await read(`/conversation/thread/messages/${threadId}`);
		let unread = 0;
		for(let message of messages){
			if(!message.unread){
				continue;
			}
			unread ++;
			fetch(`${Conf.platform}/conversation/message/${message.id}`);
		}

		Tracking.logEvent('readConversation', {
			application: 'conversation',
			unread: unread
		});

		dispatch({
			type: 'READ_THREAD_CONVERSATION',
			messages: messages.map(m => ({ ...m, unread: false })),
			threadId: threadId
		});
	}
	catch(e){
		console.log(e);
	}
}

export const openThread = dispatch => (thread: string) => {
	dispatch({
		type: 'OPEN_THREAD_CONVERSATION',
		threadId: thread
	});
}

export const findReceivers = (to, from, cc) => {
	cc = cc || [];
	let newTo = [...to, ...cc, from].filter(el => el !== Me.session.userId);
	if(newTo.length === 0){
		return [Me.session.userId];
	}
	return newTo;
};