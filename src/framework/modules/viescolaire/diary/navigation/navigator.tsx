import * as React from 'react';

import { assertSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import moduleConfig from '~/framework/modules/viescolaire/diary/module-config';
import DiaryHomeworkScreen, { computeNavBar as homeworkNavBar } from '~/framework/modules/viescolaire/diary/screens/homework';
import DiaryHomeworkListScreen, {
  computeNavBar as homeworkListNavBar,
} from '~/framework/modules/viescolaire/diary/screens/homework-list';
import DiarySessionScreen, { computeNavBar as sessionNavBar } from '~/framework/modules/viescolaire/diary/screens/session';
import DiaryTimetableScreen, { computeNavBar as timetableNavBar } from '~/framework/modules/viescolaire/diary/screens/timetable';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { DiaryNavigationParams, diaryRouteNames } from '.';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<DiaryNavigationParams>(moduleConfig.name, Stack => {
    /**
     * This module has no fixed home screen. We dynamically update `moduleConfig.routeName` to point to the "home" depending of user type.
     * Teachers will have timetable as home, while others will have homework list.
     */

    const screens: React.ReactElement[] = [];
    const session = assertSession();

    if (session?.user.type === UserType.Teacher) {
      screens.push(<Stack.Screen name={diaryRouteNames.timetable} component={DiaryTimetableScreen} options={timetableNavBar} />);
      moduleConfig.routeName = diaryRouteNames.timetable;
    } else {
      screens.push(
        <Stack.Screen name={diaryRouteNames.homeworkList} component={DiaryHomeworkListScreen} options={homeworkListNavBar} />,
      );
      moduleConfig.routeName = diaryRouteNames.homeworkList;
    }

    screens.push(
      <Stack.Screen name={diaryRouteNames.homework} component={DiaryHomeworkScreen} options={homeworkNavBar} />,
      <Stack.Screen name={diaryRouteNames.session} component={DiarySessionScreen} options={sessionNavBar} />,
    );

    return <>{screens}</>;
  });
