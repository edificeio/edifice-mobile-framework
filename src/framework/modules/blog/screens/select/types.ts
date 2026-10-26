import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';
import type { ResourceExplorerTemplate } from '~/framework/modules/explorer/templates/resource-explorer';

export interface BlogSelectScreenNavParams extends ResourceExplorerTemplate.NavParams {
  /** Where the user started from, which the created post is tracked under. */
  source: string;
}

export type BlogSelectScreenNavigationProps = NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.select>;

export interface BlogSelectScreenProps
  extends
    Omit<ResourceExplorerTemplate.ScreenProps, keyof ResourceExplorerTemplate.NavigationProps>,
    BlogSelectScreenNavigationProps {}
