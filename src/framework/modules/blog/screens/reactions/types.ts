import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';

export interface BlogReactionsScreenDataProps {}
export interface BlogReactionsScreenEventProps {}
export interface BlogReactionsScreenNavParams {
  blogPostId: string;
}
export type BlogReactionsScreenProps = BlogReactionsScreenDataProps &
  BlogReactionsScreenEventProps &
  NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.blogReactions>;
