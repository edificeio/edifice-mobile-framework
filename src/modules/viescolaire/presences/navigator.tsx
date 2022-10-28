import { createStackNavigator } from 'react-navigation-stack';

import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';
import { UserType, getUserSession } from '~/framework/util/session';
import { addViewTrackingToStackRoutes } from '~/framework/util/tracker/withViewTracking';

import DeclareEvent from './components/DeclareEvent';
import CallList from './containers/CallList';
import Declaration from './containers/Declaration';
import History from './containers/History';
import Memento from './containers/Memento';
import TeacherCallSheet from './containers/TeacherCallSheet';
import moduleConfig from './moduleConfig';

export const presencesRoutes = {
  [`${moduleConfig.routeName}/call`]: {
    screen: TeacherCallSheet,
  },
  [`${moduleConfig.routeName}/declaration/relative`]: {
    screen: Declaration,
  },
  [`${moduleConfig.routeName}/declaration/teacher`]: {
    screen: DeclareEvent,
  },
  [`${moduleConfig.routeName}/history`]: {
    screen: History,
  },
  [`${moduleConfig.routeName}/memento`]: {
    screen: Memento,
  },
};

export default (matchingApps: IEntcoreApp[], matchingWidgets: IEntcoreWidget[]) => {
  const routes: Parameters<typeof createStackNavigator>['0'] = {};
  const role = getUserSession().user.type;

  if (role === UserType.Student) {
    routes[`${moduleConfig.routeName}/history`] = {
      screen: History,
    };
  } else if (role === UserType.Relative) {
    routes[`${moduleConfig.routeName}/history`] = {
      screen: History,
    };
    routes[`${moduleConfig.routeName}/declaration/relative`] = {
      screen: Declaration,
    };
  } else {
    routes[`${moduleConfig.routeName}/calls`] = {
      screen: CallList,
    };
    routes[`${moduleConfig.routeName}/call`] = {
      screen: TeacherCallSheet,
    };
    routes[`${moduleConfig.routeName}/declaration/teacher`] = {
      screen: DeclareEvent,
    };
    routes[`${moduleConfig.routeName}/memento`] = {
      screen: Memento,
    };
  }

  return createStackNavigator(addViewTrackingToStackRoutes(routes), {
    headerMode: 'none',
  });
};
