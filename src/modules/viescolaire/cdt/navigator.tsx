import { createStackNavigator } from 'react-navigation-stack';

import CdtTimetableTeachers from './containers/CdtTimetableTeachers';
import Homework from './containers/Homework';
import HomeworkList from './containers/HomeworkList';
import Session from './containers/Session';

export default createStackNavigator(
  {
    HomeworkList,
    HomeworkPage: Homework,
    SessionPage: Session,
    CdtTeachers: CdtTimetableTeachers,
  },
  {
    headerMode: 'none',
  },
);
