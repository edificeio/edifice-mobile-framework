import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { BlogPostViews } from '~/framework/modules/blog/model';
import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';

export interface BlogAudienceScreenDataProps {
  session: AuthActiveAccount;
}
export interface BlogAudienceScreenEventProps {
  handleGetBlogPostViews(blogPostId: string): Promise<BlogPostViews>;
}
export interface BlogAudienceScreenNavParams {
  blogPostId: string;
}
export type BlogAudienceScreenProps = BlogAudienceScreenDataProps &
  BlogAudienceScreenEventProps &
  NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.blogAudience>;
