/**
 * Blog actions
 */

import { ThunkDispatch } from "redux-thunk";
import workspaceService from "../../../framework/modules/workspace/service";
import { IDistantFile, LocalFile } from "../../../framework/util/fileHandler";
import { getUserSession } from "../../../framework/util/session";
import moduleConfig from "../moduleConfig";
import { getPublishableBlogs, IBlog } from "../reducer";
import { createBlogPostResourceRight, getBlogPostRight, publishBlogPostResourceRight, submitBlogPostResourceRight } from "../rights";
import { blogService } from "../service";
import workspaceFileTransferActions from "../../../framework/modules/workspace/actions/fileTransfer";

/**
 * Fetch the details of a given blog post.
 * Info: no reducer is used in this action.
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

/**
 * Fetch the user's publishable blog list.
 * Info: no reducer is used in this action.
 */
export const getPublishableBlogListAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const session = getUserSession(getState());

    const allBlogs = await blogService.list(session);
    const publishableBlogs = getPublishableBlogs(session, allBlogs);
    return publishableBlogs;
  } catch (e) {
    // ToDo: Error handling
    console.warn(`[${moduleConfig.name}] getBlogListAction failed`, e);
  }
}

export const uploadBlogPostImagesAction = (images: LocalFile[]) =>
  async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    return dispatch(workspaceFileTransferActions.uploadFilesAction(
      images, {
        parent: 'protected'
      }
    ));
  }

/**
 * Create and submit/publish a post for a given blog.
 * Info: no reducer is used in this action.
 */
 export const sendBlogPostAction = (blog: IBlog, postTitle: string, postContent: string, uploadedPostImages?: IDistantFile[]) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const session = getUserSession(getState());
    const blogId = blog.id;
    const blogPostRight = getBlogPostRight(blog, session);
    if (!blogPostRight) {
      throw new Error("[sendBlogPostAction] user has no post rights for this blog");
    }

    // Create post
    const postId = await dispatch(createBlogPostAction(
      blogId,
      postTitle,
      postContent,
      uploadedPostImages
    )) as unknown as string;
    
    // Submit or publish post
    if (!postId) {
      throw new Error("[sendBlogPostAction] failed to access id of created post");
    }
    const blogPostActionRight = blogPostRight.actionRight;
    const shareAction = {
      [createBlogPostResourceRight]: undefined,
      [submitBlogPostResourceRight]: () => dispatch(submitBlogPostAction(blogId, postId)) as unknown as Promise<string>,
      [publishBlogPostResourceRight]: () => dispatch(publishBlogPostAction(blogId, postId)) as unknown as Promise<string>
    }[blogPostActionRight];
    shareAction && await shareAction();
  } catch (e) {
    // ToDo: Error handling
    console.warn(`[${moduleConfig.name}] sendBlogPostAction failed`, e);
  }
}

/**
 * Create a post for a given blog.
 * Info: no reducer is used in this action.
 */
 export const createBlogPostAction = (blogId: string, postTitle: string, postContent: string, uploadedPostImages?: IDistantFile[]) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const session = getUserSession(getState());

    let postContentHtml = `<p class="ng-scope" style="">${postContent}</p>`;
    if (uploadedPostImages) {
      const postImageUploads = Object.values(uploadedPostImages);
      const images = postImageUploads.map(postImageUpload => `<img src="${postImageUpload.url}?thumbnail=2600x0" class="">`).join("");
      const imagesHtml =
        `<p class="ng-scope" style="">
        <span contenteditable="false" class="image-container ng-scope" style="">
          ${images}
        </span>
      </p>`;
      postContentHtml = postContentHtml + imagesHtml;
    }

    const createdPost = await blogService.post.create(session, blogId, postTitle, postContentHtml);
    const postId = createdPost._id;
    return postId;
  } catch (e) {
    // ToDo: Error handling
    console.warn(`[${moduleConfig.name}] createBlogPostAction failed`, e);
  }
}

/**
 * Submit a created post for a given blog.
 * Info: no reducer is used in this action.
 */
 export const submitBlogPostAction = (blogId: string, postId: string) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const session = getUserSession(getState());

    return blogService.post.submit(session, blogId, postId);
  } catch (e) {
    // ToDo: Error handling
    console.warn(`[${moduleConfig.name}] submitBlogPostAction failed`, e);
  }
}

/**
 * Publish a created post for a given blog.
 * Info: no reducer is used in this action.
 */
 export const publishBlogPostAction = (blogId: string, postId: string) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const session = getUserSession(getState());

    return blogService.post.publish(session, blogId, postId);
  } catch (e) {
    // ToDo: Error handling
    console.warn(`[${moduleConfig.name}] publishBlogPostAction failed`, e);
  }
}