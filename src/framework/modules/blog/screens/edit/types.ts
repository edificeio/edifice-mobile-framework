import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';
import { Blog } from '~/framework/modules/blog/reducer';

export interface BlogEditPostScreenDataProps {
  session?: ISession;
}

export interface BlogEditPostScreenEventProps {
  handleEditBlogPost(blog: Blog, postId: string, title: string, content: string, postState: string): Promise<string | undefined>;
}

export interface BlogEditPostScreenNavParams {
  blog: Blog;
  title: string;
  content: string;
  postId: string;
  postState: string;
}

export type BlogEditPostScreenProps = BlogEditPostScreenDataProps &
  BlogEditPostScreenEventProps &
  NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.blogEditPost>;
