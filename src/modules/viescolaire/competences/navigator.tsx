import { createStackNavigator } from 'react-navigation-stack';

import Competences from './containers/Evaluation';
import moduleConfig from './moduleConfig';

export const competencesRoutes = {
  [`${moduleConfig.routeName}`]: {
    screen: Competences,
  },
};

export default () =>
  createStackNavigator(
    {
      ...competencesRoutes,
    },
    {
      headerMode: 'none',
    },
  );
