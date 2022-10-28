import I18n from 'i18n-js';
import { createStackNavigator } from 'react-navigation-stack';

import { addViewTrackingToStackRoutes } from '~/framework/util/tracker/withViewTracking';

import moduleConfig from './moduleConfig';
import WorkspaceFileDetailsScreen from './screens/WorkspaceFileDetailsScreen';
import WorkspaceFileListScreen from './screens/WorkspaceFileListScreen';

export const timelineRoutes = addViewTrackingToStackRoutes({
  [moduleConfig.routeName]: {
    screen: WorkspaceFileListScreen,
  },
  [`${moduleConfig.routeName}/details`]: {
    screen: WorkspaceFileDetailsScreen,
  },
});

export default () =>
  createStackNavigator(
    {
      ...timelineRoutes,
    },
    {
      initialRouteParams: {
        filter: 'root',
        parentId: 'root',
        title: I18n.t('workspace.tabName'),
      },
      headerMode: 'none',
    },
  );
