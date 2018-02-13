import { Conf } from "../Conf"
import {
	PATH_CONVERSATION,
	PATH_CREATE_CONVERSATION,
	PATH_NEW_MESSAGES,
	PATH_NEWS,
	PATH_PREVIOUS_MESSAGES,
	replace1,
} from "../constants/paths"
import {create, read, readCheck, readNext} from "./docs"

export const readConversation = (page = 0) => read(replace1(PATH_CONVERSATION, page), false)

export const readNextConversation = page => readNext(PATH_CONVERSATION, page, false)

export const readNextThreads = id => readCheck(PATH_NEW_MESSAGES, id, false)

export const readPrevThreads = id => readCheck(PATH_PREVIOUS_MESSAGES, id, false)

export const createConversation = payload => create(PATH_CREATE_CONVERSATION, payload, false)

export const sendMessage = dispatch => async (
	data: { subject: string; to: any[]; cc: any[]; body: string; parentId?: string },
	userId
) => {
	dispatch({
		type: "CONVERSATION_SEND",
		data: { ...data, conversation: data.parentId, from: userId },
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
		let json = await response.json()

		dispatch({
			type: "CONVERSATION_SENT",
			data: data,
		})

		dispatch(read(PATH_CONVERSATION, true))
	} catch (e) {
		console.log(e)
		dispatch({
			type: "CONVERSATION_FAILED_SEND",
			data: data,
		})
	}
}
