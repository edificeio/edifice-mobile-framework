import { Conf } from '../Conf';
import {
	PATH_CONVERSATION,
	PATH_CREATE_CONVERSATION,
	PATH_NEW_MESSAGES,
	PATH_PREVIOUS_MESSAGES,
} from "../constants/paths";
import { create, read, readMerge } from "./docs";

console.log(Conf);

export const readConversation = () => read(PATH_CONVERSATION, true)

export const readNextThreads = () => readMerge(PATH_NEW_MESSAGES, true)

export const readPrevThreads = () => readMerge(PATH_PREVIOUS_MESSAGES, true)

export const sendMessage = dispatch => async (data: { subject: string, to: any[], cc:any[], body: string, parentId?: string }, userId) => {
	dispatch({
		type: 'CONVERSATION_SEND',
		data: { ...data, conversation: data.parentId, from: userId }
	});

	try{
		const response = await fetch(`${ Conf.platform }/conversation/send?In-Reply-To=${data.parentId}`, {
			method: 'post',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				body: data.body,
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

		dispatch(read(PATH_CONVERSATION, true));
	}
	catch(e){
		console.log(e);
		dispatch({
			type: 'CONVERSATION_FAILED_SEND',
			data: data
		});
	}
}