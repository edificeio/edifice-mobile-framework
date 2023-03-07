import { NavigationInjectedProps } from 'react-navigation';
import { ThunkDispatch } from 'redux-thunk';

import { IResourceUriNotification, ITimelineNotification } from '~/framework/util/notifications';
import { IUserSession } from '~/framework/util/session';
import { IBlog, IBlogPost } from '~/modules/blog/reducer';
import { IDisplayedBlog } from '~/modules/blog/screens/BlogExplorerScreen';

export interface IBlogPostDetailsScreenDataProps {
  session: IUserSession;
}
export interface IBlogPostDetailsScreenEventProps {
  handleGetBlogPostDetails(blogPostId: { blogId: string; postId: string }, blogPostState?: string): Promise<IBlogPost | undefined>;
  handlePublishBlogPostComment(blogPostId: { blogId: string; postId: string }, comment: string): Promise<number | undefined>;
  handleUpdateBlogPostComment(
    blogPostCommentId: { blogId: string; postId: string; commentId: string },
    comment: string,
  ): Promise<number | undefined>;
  handleDeleteBlogPostComment(blogPostCommentId: {
    blogId: string;
    postId: string;
    commentId: string;
  }): Promise<number | undefined>;
  handleDeleteBlogPost(blogPostCommentId: { blogId: string; postId: string }): Promise<number | undefined>;
  handlePublishBlogPost(blogPostId: { blogId: string; postId: string }): Promise<{ number: number } | undefined>;
  dispatch: ThunkDispatch<any, any, any>;
}
export interface IBlogPostDetailsScreenNavParams {
  notification: ITimelineNotification & IResourceUriNotification;
  blogPost?: IBlogPost;
  blogId?: string;
  blog: IDisplayedBlog;
  useNotification?: boolean;
}
export type IBlogPostDetailsScreenProps = IBlogPostDetailsScreenDataProps &
  IBlogPostDetailsScreenEventProps &
  NavigationInjectedProps<Partial<IBlogPostDetailsScreenNavParams>>;

export enum BlogPostDetailsLoadingState {
  PRISTINE,
  INIT,
  REFRESH,
  DONE,
}
export enum BlogPostCommentLoadingState {
  PRISTINE,
  PUBLISH,
  DONE,
}
export interface IBlogPostDetailsScreenState {
  loadingState: BlogPostDetailsLoadingState;
  publishCommentLoadingState: BlogPostCommentLoadingState;
  updateCommentLoadingState: BlogPostCommentLoadingState;
  blogInfos: IDisplayedBlog | IBlog | undefined;
  blogPostData: IBlogPost | undefined;
  errorState: boolean;
  showHeaderTitle: boolean;
  isCommentFieldFocused: boolean;
}
