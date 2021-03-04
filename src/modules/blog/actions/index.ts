/**
 * Blog actions
 */

import { ThunkDispatch } from "redux-thunk";
import { getUserSession } from "../../../framework/session";
import moduleConfig from "../moduleConfig";
import { blogService } from "../service";

/**
 * Fetch the details of a given blog post.
 */
export const getBlogPostDetailsAction = (blogPostId: { blogId: string, postId: string }) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const session = getUserSession(getState());

    // Get blog post and comments
    const [blogPost, blogPostComments] = await Promise.all([
      blogService.post.get(session, blogPostId),
      blogService.comments.get(session, blogPostId)
    ]);
    const blogPostWithComments = {
      ...blogPost,
      comments: blogPostComments
    };
    return blogPostWithComments;
  } catch (e) {
    // ToDo: Error handling
    console.warn(`[${moduleConfig.name}] getBlogPostDetailsAction failed`, e);
  }
};
