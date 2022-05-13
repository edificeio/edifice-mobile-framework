import moment from 'moment';
import * as React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { getSessionInfo } from '~/App';
import { getUserSession } from '~/framework/util/session';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { fetchHomeworkListAction, updateHomeworkProgressAction } from '~/modules/viescolaire/cdt/actions/homeworks';
import { IHomeworkListState, getHomeworksListState } from '~/modules/viescolaire/cdt/state/homeworks';
import { fetchLevelsAction } from '~/modules/viescolaire/competences/actions/competencesLevels';
import { fetchDevoirListAction } from '~/modules/viescolaire/competences/actions/devoirs';
import { ILevelsList, getLevelsListState } from '~/modules/viescolaire/competences/state/competencesLevels';
import { getDevoirListState } from '~/modules/viescolaire/competences/state/devoirs';
import { fetchPersonnelListAction } from '~/modules/viescolaire/viesco/actions/personnel';
import { fetchSubjectListAction } from '~/modules/viescolaire/viesco/actions/subjects';
import DashboardComponent from '~/modules/viescolaire/viesco/components/DashboardStudent';
import { getSubjectsListState } from '~/modules/viescolaire/viesco/state/subjects';
import { getUserSession } from '~/framework/util/session';

import { IAuthorizedViescoApps } from './Dashboard';

class Dashboard extends React.PureComponent<{
  authorizedViescoApps: IAuthorizedViescoApps;
  homeworks: IHomeworkListState;
  structureId: string;
  childId: string;
  levels: ILevelsList;
  getSubjects: (structureId: string) => void;
  getTeachers: (structureId: string) => void;
  getHomeworks: (structureId: string, startDate: string, endDate: string) => void;
  getDevoirs: (structureId: string, childId: string) => void;
  getLevels: (structureId: string) => void;
  navigation: NavigationScreenProp<any>;
}> {
  constructor(props) {
    super(props);
    const { structureId, getHomeworks, childId } = props;
    this.state = {
      // fetching next month homeworks only, when screen is focused
      focusListener: this.props.navigation.addListener('willFocus', () => {
        getHomeworks(structureId, moment().format('YYYY-MM-DD'), moment().add(1, 'month').format('YYYY-MM-DD'));
        this.props.getDevoirs(structureId, childId);
      }),
    };
  }

  public componentDidMount() {
    const { structureId } = this.props;
    this.props.getSubjects(structureId);
    this.props.getTeachers(structureId);
    this.props.getLevels(structureId);
  }

  public render() {
    return <DashboardComponent {...this.props} />;
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  const homeworks = getHomeworksListState(state);
  const subjects = getSubjectsListState(state);
  const structureId = getSessionInfo().administrativeStructures[0].id || getSessionInfo().structures[0];
  const childId = getUserSession().user.id;
  const evaluations = getDevoirListState(state);
  const levels = getLevelsListState(state).data;

  return {
    homeworks,
    subjects,
    structureId,
    childId,
    evaluations,
    levels,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      getSubjects: fetchSubjectListAction,
      getTeachers: fetchPersonnelListAction,
      getHomeworks: fetchHomeworkListAction,
      updateHomeworkProgress: updateHomeworkProgressAction,
      getDevoirs: fetchDevoirListAction,
      getLevels: fetchLevelsAction,
    },
    dispatch,
  );
};

export default withViewTracking('viesco')(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
