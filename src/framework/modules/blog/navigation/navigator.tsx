import * as React from 'react';

import BlogCreatePostScreen, { computeNavBar as blogCreatePostNavBar } from '~/framework/modules/blog/screens/BlogCreatePostScreen';
import BlogExplorerScreen, { computeNavBar as blogExplorerNavBar } from '~/framework/modules/blog/screens/BlogExplorerScreen';
import BlogPostListScreen, { computeNavBar as blogPostListNavBar } from '~/framework/modules/blog/screens/BlogPostListScreen';
import BlogSelectScreen, { computeNavBar as blogSelectNavBar } from '~/framework/modules/blog/screens/BlogSelectScreen';
import BlogPostDetailsScreen, { computeNavBar as blogPostDetailsNavBar } from '~/framework/modules/blog/screens/blog-post-details';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { BlogNavigationParams, blogRouteNames } from '.';
import moduleConfig from '../module-config';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<BlogNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={blogRouteNames.home} component={BlogSelectScreen} options={blogSelectNavBar} initialParams={{}} />
      <Stack.Screen
        name={blogRouteNames.blogExplorer}
        component={BlogExplorerScreen}
        options={blogExplorerNavBar}
        initialParams={{}}
      />
      <Stack.Screen
        name={blogRouteNames.blogPostList}
        component={BlogPostListScreen}
        options={blogPostListNavBar}
        initialParams={{}}
      />
      <Stack.Screen
        name={blogRouteNames.blogPostDetails}
        component={BlogPostDetailsScreen}
        options={blogPostDetailsNavBar}
        initialParams={{}}
      />
      <Stack.Screen
        name={blogRouteNames.blogCreatePost}
        component={BlogCreatePostScreen}
        options={blogCreatePostNavBar}
        initialParams={{}}
      />
    </>
  ));
