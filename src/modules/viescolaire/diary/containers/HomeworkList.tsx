import I18n from 'i18n-js';
import * as React from 'react';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { PageView } from '~/framework/components/page';
import { getUserSession } from '~/framework/util/session';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { fetchPersonnelListAction } from '~/modules/viescolaire/dashboard/actions/personnel';
import { getSelectedChild, getSelectedChildStructure } from '~/modules/viescolaire/dashboard/state/children';
import { IPersonnelList, getPersonnelListState } from '~/modules/viescolaire/dashboard/state/personnel';
import { viescoTheme } from '~/modules/viescolaire/dashboard/utils/viescoTheme';
import {
  fetchDiaryHomeworksAction,
  fetchDiaryHomeworksFromChildAction,
  fetchDiarySessionsAction,
  fetchDiarySessionsFromChildAction,
  updateDiaryHomeworkProgressAction,
} from '~/modules/viescolaire/diary/actions';
import HomeworkList from '~/modules/viescolaire/diary/components/HomeworkList';
import moduleConfig from '~/modules/viescolaire/diary/moduleConfig';

type HomeworkListProps = {
  homeworks: any;
  sessions: any;
  personnel: IPersonnelList;
  childId: string;
  structureId: string;
  fetchHomeworks: any;
  fetchPersonnel: any;
  fetchSessions: any;
  fetchChildHomeworks: any;
  fetchChildSessions: any;
  updateHomeworkProgress?: any;
  isFetchingHomework: boolean;
  isFetchingSession: boolean;
} & NavigationInjectedProps;

class HomeworkListRelativeContainer extends React.PureComponent<HomeworkListProps> {
  componentDidMount() {
    this.props.fetchPersonnel(this.props.structureId);
  }

  private fetchHomeworks = (startDate, endDate) =>
    getUserSession().user.type === 'Student'
      ? this.props.fetchHomeworks(this.props.structureId, startDate, endDate)
      : this.props.fetchChildHomeworks(this.props.childId, this.props.structureId, startDate, endDate);

  private fetchSessions = (startDate, endDate) =>
    getUserSession().user.type === 'Student'
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
            backgroundColor: viescoTheme.palette.diary,
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

const mapStateToProps = (gs: any): any => {
  const state = moduleConfig.getState(gs);
  const personnelState = getPersonnelListState(gs);

  return {
    homeworks: state.homeworks.data,
    sessions: state.sessions.data,
    personnel: personnelState.data,
    isFetchingHomework: state.homeworks.isFetching || personnelState.isFetching,
    isFetchingSession: state.sessions.isFetching || personnelState.isFetching,
    childId: getSelectedChild(gs).id,
    structureId:
      getUserSession().user.type === 'Student'
        ? gs.user.info.administrativeStructures[0].id || gs.user.info.structures[0]
        : getSelectedChildStructure(gs)?.id,
  };
};

const mapDispatchToProps = (dispatch: any, props: HomeworkListProps) => {
  return bindActionCreators(
    {
      fetchChildHomeworks: fetchDiaryHomeworksFromChildAction,
      fetchChildSessions: fetchDiarySessionsFromChildAction,
      fetchHomeworks: fetchDiaryHomeworksAction,
      fetchPersonnel: fetchPersonnelListAction,
      fetchSessions: fetchDiarySessionsAction,
      updateHomeworkProgress: updateDiaryHomeworkProgressAction,
    },
    dispatch,
  );
};

export default withViewTracking('viesco/cdt')(connect(mapStateToProps, mapDispatchToProps)(HomeworkListRelativeContainer));
