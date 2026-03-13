import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';

export interface BlogPostListScreenNavigationParams {
  blogId: string;
  forceReload?: boolean;
}
export type BlogPostListScreenProps = NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.blogPostList>;
