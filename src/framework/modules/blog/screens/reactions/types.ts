import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';
import { AudienceReactions } from '~/framework/modules/core/audience/types';

export interface BlogReactionsScreenDataProps {
  session: AuthActiveAccount;
}
export interface BlogReactionsScreenEventProps {
  handleGetBlogPostReactions(blogPostId: string): Promise<AudienceReactions>;
}
export interface BlogReactionsScreenNavParams {
  blogPostId: string;
}
export type BlogReactionsScreenProps = BlogReactionsScreenDataProps &
  BlogReactionsScreenEventProps &
  NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.blogReactions>;
