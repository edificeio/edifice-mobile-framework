import { Conf } from "../../Conf";
import { read } from "../../infra/Cache";

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