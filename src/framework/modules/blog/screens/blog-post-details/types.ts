import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThunkDispatch } from 'redux-thunk';

import { InfoCommentField } from '~/framework/components/commentField';
import { ISession } from '~/framework/modules/auth/model';
import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';
import { Blog, BlogPost } from '~/framework/modules/blog/reducer';
import { DisplayedBlog } from '~/framework/modules/blog/screens/BlogExplorerScreen';
import { IResourceUriNotification } from '~/framework/util/notifications';

export interface BlogPostDetailsScreenDataProps {
  session?: ISession;
}
export interface BlogPostDetailsScreenEventProps {
  handleGetBlogPostDetails(blogPostId: { blogId: string; postId: string }, blogPostState?: string): Promise<BlogPost | undefined>;
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
export interface BlogPostDetailsScreenNavParams {
  notification: IResourceUriNotification;
  blogPost?: BlogPost;
  blogId?: string;
  blog?: DisplayedBlog;
  useNotification?: boolean;
}
export type BlogPostDetailsScreenProps = BlogPostDetailsScreenDataProps &
  BlogPostDetailsScreenEventProps &
  NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.blogPostDetails>;

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
export interface BlogPostDetailsScreenState {
  loadingState: BlogPostDetailsLoadingState;
  publishCommentLoadingState: BlogPostCommentLoadingState;
  updateCommentLoadingState: BlogPostCommentLoadingState;
  blogInfos: DisplayedBlog | Blog | undefined;
  blogPostData: BlogPost | undefined;
  errorState: boolean;
  showHeaderTitle: boolean;
  isCommentFieldFocused: boolean;
  infoComment: InfoCommentField;
}
