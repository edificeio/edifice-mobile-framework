import { createStackNavigator } from 'react-navigation-stack';

import moduleConfig from './moduleConfig';
import WorkspaceFileDetails from './screens/WorkspaceFileDetails';
import WorkspaceFileList from './screens/WorkspaceFileList';

export const timelineRoutes = {
  [`${moduleConfig.routeName}`]: {
    screen: WorkspaceFileList,
  },
  [`${moduleConfig.routeName}/details`]: {
    screen: WorkspaceFileDetails,
  },
};

export default () =>
  createStackNavigator(
    {
      ...timelineRoutes,
    },
    {
      headerMode: 'none',
    },
  );
