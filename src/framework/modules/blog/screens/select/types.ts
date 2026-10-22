import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';
import type { BlogList } from '~/framework/modules/blog/reducer';

export interface BlogSelectScreenNavParams {
  blogsData: BlogList;
  // Where the user started from, which the created post is tracked under.
  source: string;
}
export type BlogSelectScreenProps = NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.select>;

export interface BlogSelectScreenState {
  blogsData: BlogList;
}
