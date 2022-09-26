import { createStackNavigator } from 'react-navigation-stack';

import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';
import { UserType, getUserSession } from '~/framework/util/session';
import { addViewTrackingToStackRoutes } from '~/framework/util/tracker/withViewTracking';

import DiaryTimetableTeachers from './containers/DiaryTimetableTeachers';
import Homework from './containers/Homework';
import HomeworkList from './containers/HomeworkList';
import Session from './containers/Session';
import moduleConfig from './moduleConfig';

export const diaryRoutes = {
  [`${moduleConfig.routeName}/homeworkList`]: {
    screen: HomeworkList,
  },
  [`${moduleConfig.routeName}/homework`]: {
    screen: Homework,
  },
  [`${moduleConfig.routeName}/session`]: {
    screen: Session,
  },
  [`${moduleConfig.routeName}/teachersTimetable`]: {
    screen: DiaryTimetableTeachers,
  },
};

export default (matchingApps: IEntcoreApp[], matchingWidgets: IEntcoreWidget[]) => {
  const routes: Parameters<typeof createStackNavigator>['0'] = {};
  const role = getUserSession().user.type;

  if (role === UserType.Student || role === UserType.Relative) {
    routes[`${moduleConfig.routeName}`] = {
      screen: HomeworkList,
    };
  } else if (role === UserType.Teacher) {
    routes[`${moduleConfig.routeName}/teachersTimetable`] = {
      screen: DiaryTimetableTeachers,
    };
  }
  routes[`${moduleConfig.routeName}/homework`] = {
    screen: Homework,
  };
  routes[`${moduleConfig.routeName}/session`] = {
    screen: Session,
  };

  return createStackNavigator(addViewTrackingToStackRoutes(routes), {
    headerMode: 'none',
  });
};
