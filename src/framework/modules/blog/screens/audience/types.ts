import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';

export interface BlogAudienceScreenDataProps {}
export interface BlogAudienceScreenEventProps {}
export interface BlogAudienceScreenNavParams {
  blogPostId: string;
}
export type BlogAudienceScreenProps = BlogAudienceScreenDataProps &
  BlogAudienceScreenEventProps &
  NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.blogAudience>;
