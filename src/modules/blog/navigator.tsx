import { createStackNavigator } from 'react-navigation-stack';

import BlogPostDetailsScreen from './screens/BlogPostDetailsScreen';
import BlogSelectScreen from './screens/BlogSelectScreen';
import BlogCreatePostScreen from './screens/BlogCreatePostScreen';
import moduleConfig from './moduleConfig';
import { addViewTrackingToStackRoutes } from '~/framework/util/tracker/withViewTracking';
import BlogExplorerScreen from './screens/BlogExplorerScreen';
import BlogPostListScreen from './screens/BlogPostListScreen';

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
