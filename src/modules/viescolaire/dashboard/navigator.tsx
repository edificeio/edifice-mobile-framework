import { createStackNavigator } from 'react-navigation-stack';

import { competencesRoutes } from '~/modules/viescolaire/competences/navigator';
import { diaryRoutes } from '~/modules/viescolaire/diary/navigator';
import { edtRoutes } from '~/modules/viescolaire/edt/navigator';
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
