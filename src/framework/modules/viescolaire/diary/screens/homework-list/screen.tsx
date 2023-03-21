import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { PageView } from '~/framework/components/page';
import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { getSelectedChild, getSelectedChildStructure } from '~/framework/modules/viescolaire/dashboard/state/children';
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

import type { DiaryHomeworkListScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<DiaryNavigationParams, typeof diaryRouteNames.homeworkList>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('Homework'),
  headerStyle: {
    backgroundColor: viescoTheme.palette.diary,
  },
});

class DiaryHomeworkListScreen extends React.PureComponent<DiaryHomeworkListScreenPrivateProps> {
  componentDidMount() {
    this.props.fetchTeachers(this.props.structureId);
  }

  private fetchHomeworks = (startDate, endDate) =>
    this.props.userType === UserType.Student
      ? this.props.fetchHomeworks(this.props.structureId, startDate, endDate)
      : this.props.fetchChildHomeworks(this.props.childId, this.props.structureId, startDate, endDate);

  private fetchSessions = (startDate, endDate) =>
    this.props.userType === UserType.Student
      ? this.props.fetchSessions(this.props.structureId, startDate, endDate)
      : this.props.fetchChildSessions(this.props.childId, startDate, endDate);

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
    const session = getSession(state);
    const userType = session?.user.type;

    return {
      childId: getSelectedChild(state)?.id,
      homeworks: diaryState.homeworks.data,
      isFetchingHomework: diaryState.homeworks.isFetching || diaryState.teachers.isFetching,
      isFetchingSession: diaryState.sessions.isFetching || diaryState.teachers.isFetching,
      sessions: diaryState.sessions.data,
      structureId: userType === UserType.Student ? session?.user.structures?.[0]?.id : getSelectedChildStructure(state)?.id,
      teachers: diaryState.teachers.data,
      userType,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchChildHomeworks: tryAction(
          fetchDiaryHomeworksFromChildAction,
          undefined,
          true,
        ) as unknown as DiaryHomeworkListScreenPrivateProps['fetchChildHomeworks'],
        fetchChildSessions: tryAction(
          fetchDiarySessionsFromChildAction,
          undefined,
          true,
        ) as unknown as DiaryHomeworkListScreenPrivateProps['fetchChildSessions'],
        fetchHomeworks: tryAction(
          fetchDiaryHomeworksAction,
          undefined,
          true,
        ) as unknown as DiaryHomeworkListScreenPrivateProps['fetchHomeworks'],
        fetchSessions: tryAction(
          fetchDiarySessionsAction,
          undefined,
          true,
        ) as unknown as DiaryHomeworkListScreenPrivateProps['fetchSessions'],
        fetchTeachers: tryAction(
          fetchDiaryTeachersAction,
          undefined,
          true,
        ) as unknown as DiaryHomeworkListScreenPrivateProps['fetchTeachers'],
        updateHomeworkProgress: tryAction(
          updateDiaryHomeworkProgressAction,
          undefined,
          true,
        ) as unknown as DiaryHomeworkListScreenPrivateProps['updateHomeworkProgress'],
      },
      dispatch,
    ),
)(DiaryHomeworkListScreen);
