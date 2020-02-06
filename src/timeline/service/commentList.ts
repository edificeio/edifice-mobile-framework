import { IBlogCommentList } from "../state/commentList";
import moment from "moment";
import { fetchJSONWithCache } from "../../infra/fetchWithCache";

// Data type of what is given by the backend.
export type IBlogCommentListBackend = Array<{
  comment: string
  id: string
  state: string
  author: {
    userId: string
    username: string
    login: string
  }
  created: {
    $date: number;
  };
}>

const blogCommentListAdapter: (
  data: IBlogCommentListBackend
) => IBlogCommentList = data => {
  let result = [] as IBlogCommentList;
  if (!data) return result;
  result = data.map(item => ({
    id: item.id,
    comment: item.comment,
    state: item.state,
    author: item.author,
    created: moment(item.created.$date),
  })).reverse()
  return result;
};

export const blogCommentListService = {
  get: async (blogPostId: string) => {
    const data = blogCommentListAdapter(
      await fetchJSONWithCache(`/blog/comments/${blogPostId}`)
    );
    return data;
  }
}
