import { createStackNavigator } from 'react-navigation-stack';

import competencesRoutes from '~/framework/modules/viescolaire/competences/navigation/navigator';
import edtRoutes from '~/framework/modules/viescolaire/edt/navigation/navigator';
import { diaryRoutes } from '~/modules/viescolaire/diary/navigator';
import { presencesRoutes } from '~/modules/viescolaire/presences/navigator';

import Dashboard from './containers/Dashboard';

export default () =>
  createStackNavigator(
    {
      Dashboard,
      ...competencesRoutes,
      ...diaryRoutes,
      ...edtRoutes,
      ...presencesRoutes,
    },
    {
      headerMode: 'none',
    },
  );
