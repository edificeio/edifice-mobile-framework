import * as React from 'react';

import moduleConfig from '~/framework/modules/blog/module-config';
import BlogExplorerScreen, { computeNavBar as blogExplorerNavBar } from '~/framework/modules/blog/screens/BlogExplorerScreen';
import BlogPostListScreen, { computeNavBar as blogPostListNavBar } from '~/framework/modules/blog/screens/BlogPostListScreen';
import BlogSelectScreen, { computeNavBar as blogSelectNavBar } from '~/framework/modules/blog/screens/BlogSelectScreen';
import BlogAudienceScreen, { computeNavBar as blogAudienceNavBar } from '~/framework/modules/blog/screens/audience';
import BlogPostDetailsScreen, { computeNavBar as blogPostDetailsNavBar } from '~/framework/modules/blog/screens/blog-post-details';
import BlogCreatePostScreen, { computeNavBar as blogCreatePostNavBar } from '~/framework/modules/blog/screens/create-post';
import BlogEditPostScreen, { computeNavBar as blogEditPostNavBar } from '~/framework/modules/blog/screens/edit';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { BlogNavigationParams, blogRouteNames } from '.';

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
      <Stack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
        <Stack.Screen
          name={blogRouteNames.blogCreatePost}
          component={BlogCreatePostScreen}
          options={blogCreatePostNavBar}
          initialParams={{}}
        />
        <Stack.Screen
          name={blogRouteNames.blogEditPost}
          component={BlogEditPostScreen}
          options={blogEditPostNavBar}
          initialParams={{}}
        />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name={blogRouteNames.blogAudience}
          component={BlogAudienceScreen}
          options={blogAudienceNavBar}
          initialParams={{}}
        />
      </Stack.Group>
    </>
  ));

setModalModeForRoutes([blogRouteNames.blogCreatePost, blogRouteNames.blogEditPost]);
