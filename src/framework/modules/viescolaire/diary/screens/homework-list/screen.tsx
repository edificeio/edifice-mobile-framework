import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import type { DiaryHomeworkListScreenDispatchProps, DiaryHomeworkListScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { PageView } from '~/framework/components/page';
import { AccountType } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { getChildStructureId } from '~/framework/modules/viescolaire/common/utils/child';
import dashboardConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import {
  fetchDiaryHomeworksAction,
  fetchDiaryHomeworksFromChildAction,
  fetchDiarySessionsAction,
  fetchDiarySessionsFromChildAction,
  fetchDiaryTeachersAction,
  updateDiaryHomeworkProgressAction,
} from '~/framework/modules/viescolaire/diary/actions';
import HomeworkList from '~/framework/modules/viescolaire/diary/components/HomeworkList';
import moduleConfig from '~/framework/modules/viescolaire/diary/module-config';
import { DiaryNavigationParams, diaryRouteNames } from '~/framework/modules/viescolaire/diary/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<DiaryNavigationParams, typeof diaryRouteNames.homeworkList>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('diary-homework-title'),
  }),
});

class DiaryHomeworkListScreen extends React.PureComponent<DiaryHomeworkListScreenPrivateProps> {
  componentDidMount() {
    this.props.tryFetchTeachers(this.props.structureId);
  }

  private fetchHomeworks = (startDate, endDate) =>
    this.props.userType === AccountType.Student
      ? this.props.tryFetchHomeworks(this.props.structureId, startDate, endDate)
      : this.props.tryFetchChildHomeworks(this.props.childId, this.props.structureId, startDate, endDate);

  private fetchSessions = (startDate, endDate) =>
    this.props.userType === AccountType.Student
      ? this.props.tryFetchSessions(this.props.structureId, startDate, endDate)
      : this.props.tryFetchChildSessions(this.props.childId, startDate, endDate);

  public render() {
    return (
      <PageView>
        <HomeworkList
          navigation={this.props.navigation}
          personnel={this.props.teachers}
          isFetchingHomework={this.props.isFetchingHomework}
          isFetchingSession={this.props.isFetchingSession}
          updateHomeworkProgress={this.props.updateHomeworkProgress}
          homeworks={this.props.homeworks}
          sessions={this.props.sessions}
          onRefreshHomeworks={this.fetchHomeworks}
          onRefreshSessions={this.fetchSessions}
          childId={this.props.childId}
          userType={this.props.userType}
        />
      </PageView>
    );
  }
}

export default connect(
  (state: IGlobalState) => {
    const diaryState = moduleConfig.getState(state);
    const dashboardState = dashboardConfig.getState(state);
    const session = getSession();
    const userType = session?.user.type;

    return {
      childId: dashboardState.selectedChildId,
      homeworks: diaryState.homeworks.data,
      isFetchingHomework: diaryState.homeworks.isFetching || diaryState.teachers.isFetching,
      isFetchingSession: diaryState.sessions.isFetching || diaryState.teachers.isFetching,
      sessions: diaryState.sessions.data,
      structureId:
        userType === AccountType.Student ? session?.user.structures?.[0]?.id : getChildStructureId(dashboardState.selectedChildId),
      teachers: diaryState.teachers.data,
      userType,
    };
  },
  dispatch =>
    bindActionCreators<DiaryHomeworkListScreenDispatchProps>(
      {
        tryFetchChildHomeworks: tryAction(fetchDiaryHomeworksFromChildAction),
        tryFetchChildSessions: tryAction(fetchDiarySessionsFromChildAction),
        tryFetchHomeworks: tryAction(fetchDiaryHomeworksAction),
        tryFetchSessions: tryAction(fetchDiarySessionsAction),
        tryFetchTeachers: tryAction(fetchDiaryTeachersAction),
        updateHomeworkProgress: tryAction(updateDiaryHomeworkProgressAction),
      },
      dispatch
    )
)(DiaryHomeworkListScreen);
