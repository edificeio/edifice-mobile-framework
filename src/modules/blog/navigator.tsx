import { createStackNavigator } from 'react-navigation-stack';

import { addViewTrackingToStackRoutes } from '~/framework/util/tracker/withViewTracking';

import moduleConfig from './moduleConfig';
import BlogCreatePostScreen from './screens/BlogCreatePostScreen';
import BlogExplorerScreen from './screens/BlogExplorerScreen';
import BlogPostListScreen from './screens/BlogPostListScreen';
import BlogSelectScreen from './screens/BlogSelectScreen';
import BlogPostDetailsScreen from './screens/blog-post-details';

export const timelineRoutes = addViewTrackingToStackRoutes({
  [`${moduleConfig.routeName}`]: {
    screen: BlogExplorerScreen,
  },
  [`${moduleConfig.routeName}/select`]: {
    screen: BlogSelectScreen,
  },
  [`${moduleConfig.routeName}/create`]: {
    screen: BlogCreatePostScreen,
  },
  [`${moduleConfig.routeName}/details`]: {
    screen: BlogPostDetailsScreen,
  },
  [`${moduleConfig.routeName}/posts`]: {
    screen: BlogPostListScreen,
  },
});

export default () =>
  createStackNavigator(
    {
      ...timelineRoutes,
    },
    {
      headerMode: 'none',
    },
  );
