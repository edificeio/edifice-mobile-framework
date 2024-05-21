import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';
import { AudienceViews } from '~/framework/modules/core/audience/types';

export interface BlogAudienceScreenDataProps {
  session: AuthActiveAccount;
}
export interface BlogAudienceScreenEventProps {
  handleGetBlogPostViews(blogPostId: string): Promise<AudienceViews>;
}
export interface BlogAudienceScreenNavParams {
  blogPostId: string;
}
export type BlogAudienceScreenProps = BlogAudienceScreenDataProps &
  BlogAudienceScreenEventProps &
  NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.blogAudience>;
