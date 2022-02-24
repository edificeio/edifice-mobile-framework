import I18n from 'i18n-js';
import * as React from 'react';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { getSessionInfo } from '~/App';
import { PageView } from '~/framework/components/page';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import {
  fetchChildHomeworkAction,
  fetchHomeworkListAction,
  updateHomeworkProgressAction,
} from '~/modules/viescolaire/cdt/actions/homeworks';
import { fetchChildSessionAction, fetchSessionListAction } from '~/modules/viescolaire/cdt/actions/sessions';
import HomeworkList from '~/modules/viescolaire/cdt/components/HomeworkList';
import { getHomeworksListState } from '~/modules/viescolaire/cdt/state/homeworks';
import { getSessionsListState } from '~/modules/viescolaire/cdt/state/sessions';
import { getSelectedChild, getSelectedChildStructure } from '~/modules/viescolaire/viesco/state/children';
import { getPersonnelListState, IPersonnelList } from '~/modules/viescolaire/viesco/state/personnel';

type HomeworkListProps = {
  homeworks: any;
  sessions: any;
  personnel: IPersonnelList;
  childId: string;
  structureId: string;
  fetchHomeworks: any;
  fetchSessions: any;
  fetchChildHomeworks: any;
  fetchChildSessions: any;
  updateHomeworkProgress?: any;
  isFetchingHomework: boolean;
  isFetchingSession: boolean;
} & NavigationInjectedProps;

class HomeworkListRelativeContainer extends React.PureComponent<HomeworkListProps> {

  private fetchHomeworks = (startDate, endDate) =>
    getSessionInfo().type === 'Student'
      ? this.props.fetchHomeworks(this.props.structureId, startDate, endDate)
      : this.props.fetchChildHomeworks(this.props.childId, this.props.structureId, startDate, endDate);

  private fetchSessions = (startDate, endDate) =>
    getSessionInfo().type === 'Student'
      ? this.props.fetchSessions(this.props.structureId, startDate, endDate)
      : this.props.fetchChildSessions(this.props.childId, startDate, endDate);

  public render() {
    const diaryTitle = this.props.navigation.getParam('diaryTitle');
    return (
      <PageView
        navigation={this.props.navigation}
        navBarWithBack={{
          title: diaryTitle || I18n.t('Homework'),
          style: {
            backgroundColor: '#2BAB6F',
          },
        }}>
        <HomeworkList
          navigation={this.props.navigation}
          personnel={this.props.personnel}
          isFetchingHomework={this.props.isFetchingHomework}
          isFetchingSession={this.props.isFetchingSession}
          updateHomeworkProgress={this.props.updateHomeworkProgress}
          homeworks={this.props.homeworks}
          sessions={this.props.sessions}
          onRefreshHomeworks={this.fetchHomeworks}
          onRefreshSessions={this.fetchSessions}
          childId={this.props.childId}
        />
      </PageView>
    );
  }
}

const mapStateToProps: (state: any) => any = state => {
  const homeworksState = getHomeworksListState(state);
  const sessionsState = getSessionsListState(state);
  const personnelState = getPersonnelListState(state);

  return {
    homeworks: homeworksState.data,
    sessions: sessionsState.data,
    personnel: personnelState.data,
    isFetchingHomework: homeworksState.isFetching || personnelState.isFetching,
    isFetchingSession: sessionsState.isFetching || personnelState.isFetching,
    childId: getSelectedChild(state).id,
    structureId:
      getSessionInfo().type === 'Student'
        ? getSessionInfo().administrativeStructures[0].id || getSessionInfo().structures[0]
        : getSelectedChildStructure(state)?.id,
  };
};

const mapDispatchToProps = (dispatch: any, props: HomeworkListProps) => {
  return bindActionCreators(
    {
      fetchChildHomeworks: fetchChildHomeworkAction,
      fetchChildSessions: fetchChildSessionAction,
      fetchHomeworks: fetchHomeworkListAction,
      fetchSessions: fetchSessionListAction,
      updateHomeworkProgress: updateHomeworkProgressAction,
    },
    dispatch,
  );
};

export default withViewTracking('viesco/cdt')(connect(mapStateToProps, mapDispatchToProps)(HomeworkListRelativeContainer));
