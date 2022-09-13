import I18n from 'i18n-js';
import { createStackNavigator } from 'react-navigation-stack';

import moduleConfig from './moduleConfig';
import WorkspaceFileDetailsScreen from './screens/WorkspaceFileDetailsScreen';
import WorkspaceFileListScreen from './screens/WorkspaceFileListScreen';

export default () =>
  createStackNavigator(
    {
      [moduleConfig.routeName]: {
        screen: WorkspaceFileListScreen,
      },
      [`${moduleConfig.routeName}/details`]: {
        screen: WorkspaceFileDetailsScreen,
      },
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
