import { Conf } from "../../Conf";
import { read } from "../../infra/Cache";

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