import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/blog/module-config';
import type { BlogExplorerScreenNavigationParams } from '~/framework/modules/blog/screens/BlogExplorerScreen';
import type { BlogPostListScreenNavigationParams } from '~/framework/modules/blog/screens/BlogPostListScreen';
import type { BlogSelectScreenNavParams } from '~/framework/modules/blog/screens/BlogSelectScreen';
import type { BlogPostDetailsScreenNavParams } from '~/framework/modules/blog/screens/blog-post-details/types';
import type { BlogCreatePostScreenNavParams } from '~/framework/modules/blog/screens/create-post/types';
import type { BlogEditPostScreenNavParams } from '~/framework/modules/blog/screens/edit/types';

export interface BlogNavigationParams extends ParamListBase {
  home: BlogSelectScreenNavParams;
  blogExplorer: BlogExplorerScreenNavigationParams;
  blogPostList: BlogPostListScreenNavigationParams;
  blogPostDetails: BlogPostDetailsScreenNavParams;
  blogCreatePost: BlogCreatePostScreenNavParams;
  blogEditPost: BlogEditPostScreenNavParams;
}

export const blogRouteNames = {
  home: `${moduleConfig.routeName}/select` as 'home',
  blogExplorer: `${moduleConfig.routeName}` as 'blogExplorer',
  blogPostList: `${moduleConfig.routeName}/posts` as 'blogPostList',
  blogPostDetails: `${moduleConfig.routeName}/details` as 'blogPostDetails',
  blogCreatePost: `${moduleConfig.routeName}/create` as 'blogCreatePost',
  blogEditPost: `${moduleConfig.routeName}/edit` as 'blogEditPost',
};
