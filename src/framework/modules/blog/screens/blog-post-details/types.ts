import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThunkDispatch } from 'redux-thunk';

import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';
import { BlogPost } from '~/framework/modules/blog/reducer';

export interface BlogPostDetailsScreenEventProps {
  handleGetBlogPostDetails(blogPostId: { blogId: string; postId: string }, blogPostState?: string): Promise<BlogPost | undefined>;
  handlePublishBlogPostComment(
    blogPostId: { blogId: string; postId: string },
    comment: string,
    replyTo?: string,
  ): Promise<number | undefined>;
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
  postId: string;
  blogId: string;
}
export type BlogPostDetailsScreenProps = BlogPostDetailsScreenEventProps &
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
