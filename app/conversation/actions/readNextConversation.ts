import { Conf } from "../../Conf";
import { fetchJSONWithCache } from "../../infra/fetchWithCache";

export const readNextConversation = dispatch => async page => {
  dispatch({
    type: "READ_NEXT_CONVERSATION"
  });

  console.log(`${Conf.platform}/conversation/threads/list?page=${page}`);
  try {
    const threads = await fetchJSONWithCache(
      `/conversation/threads/list?page=${page}`
    );
    dispatch({
      type: "APPEND_NEXT_CONVERSATION",
      threads: threads,
      page: page + 1
    });
  } catch (e) {
    dispatch({
      type: "END_REACHED_CONVERSATION"
    });
  }
};
