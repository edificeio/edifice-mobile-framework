import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';

export interface BlogReactionsScreenDataProps {
  session: AuthActiveAccount;
}
export interface BlogReactionsScreenEventProps {
  //TODO fix any type
  handleGetBlogPostReactions(blogPostId: string): Promise<any>;
}
export interface BlogReactionsScreenNavParams {
  blogPostId: string;
}
export type BlogReactionsScreenProps = BlogReactionsScreenDataProps &
  BlogReactionsScreenEventProps &
  NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.blogReactions>;
