import { createAsyncActionTypes, AsyncState } from "../../infra/redux/async2";

// THE MODEL --------------------------------------------------------------------------------------

export interface IBlog {
  _id: string;
  visibility: string;
  title: string;
  thumbnail?: string;
  'comment-type': string;
  'publish-type': string;
  description?: string;
  created: { $date: number };
  modified: { $date: number };
  author: { userId: string; username: string; login: string; }
  shared?: Array<{ userId?: string; groupId?: string;[key: string]: boolean | string | undefined }>;
  fetchPosts: any[] // ToDo: Type this.
}

export type IBlogList = IBlog[];

// THE STATE --------------------------------------------------------------------------------------

export type IPublishableBlogsState = AsyncState<IBlogList>;

export const initialState: IBlogList = [];

/** Returns the sub local state (global state -> notification -> notificationList). Give the global state as parameter. */
export const getPublishableBlogsState = (globalState: any) =>
  globalState.timeline.publishableBlogs as IPublishableBlogsState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const publishableBlogsActionTypes = createAsyncActionTypes('TIMELINE_PUBLISHABLE_BLOGS');

export const blogPublishActionTypes = createAsyncActionTypes('TIMELINE_BLOG_PUBLISH');
