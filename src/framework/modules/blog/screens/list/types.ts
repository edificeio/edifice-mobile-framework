import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';
import { DisplayedBlog } from '~/framework/modules/blog/screens/BlogExplorerScreen';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface BlogPostListScreenDataProps {
  initialLoadingState: AsyncPagedLoadingState;
  session?: AuthActiveAccount;
}
export interface BlogPostListScreenEventProps {}
export interface BlogPostListScreenNavigationParams {
  selectedBlog: DisplayedBlog;
}
export type BlogPostListScreenProps = BlogPostListScreenDataProps &
  BlogPostListScreenEventProps &
  NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.blogPostList>;
