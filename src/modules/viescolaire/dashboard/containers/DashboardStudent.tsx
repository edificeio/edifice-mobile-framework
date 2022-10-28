import moment from 'moment';
import * as React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { AsyncState } from '~/framework/util/redux/async';
import { getUserSession } from '~/framework/util/session';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { fetchCompetencesDevoirsAction, fetchCompetencesLevelsAction } from '~/modules/viescolaire/competences/actions';
import competencesConfig from '~/modules/viescolaire/competences/moduleConfig';
import { IDevoirsMatieres, ILevel } from '~/modules/viescolaire/competences/reducer';
import { fetchPersonnelListAction } from '~/modules/viescolaire/dashboard/actions/personnel';
import { fetchSubjectListAction } from '~/modules/viescolaire/dashboard/actions/subjects';
import DashboardComponent from '~/modules/viescolaire/dashboard/components/DashboardStudent';
import { getSubjectsListState } from '~/modules/viescolaire/dashboard/state/subjects';
import { fetchDiaryHomeworksAction, updateDiaryHomeworkProgressAction } from '~/modules/viescolaire/diary/actions';
import diaryConfig from '~/modules/viescolaire/diary/moduleConfig';
import { IHomeworkMap } from '~/modules/viescolaire/diary/reducer';

import { IAuthorizedViescoApps } from './Dashboard';

class Dashboard extends React.PureComponent<{
  authorizedViescoApps: IAuthorizedViescoApps;
  homeworks: AsyncState<IHomeworkMap>;
  structureId: string;
  childId: string;
  evaluations: AsyncState<IDevoirsMatieres>;
  levels: ILevel[];
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
        getHomeworks(structureId, moment().add(1, 'days').format('YYYY-MM-DD'), moment().add(1, 'month').format('YYYY-MM-DD'));
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

const mapStateToProps = (gs: any): any => {
  const competencesState = competencesConfig.getState(gs);
  const diaryState = diaryConfig.getState(gs);
  const subjects = getSubjectsListState(gs);
  const structureId = gs.user.info.administrativeStructures[0].id || gs.user.info.structures[0];
  const childId = getUserSession().user.id;

  return {
    homeworks: diaryState.homeworks,
    subjects,
    structureId,
    childId,
    evaluations: competencesState.devoirsMatieres,
    levels: competencesState.levels.data,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      getSubjects: fetchSubjectListAction,
      getTeachers: fetchPersonnelListAction,
      getHomeworks: fetchDiaryHomeworksAction,
      updateHomeworkProgress: updateDiaryHomeworkProgressAction,
      getDevoirs: fetchCompetencesDevoirsAction,
      getLevels: fetchCompetencesLevelsAction,
    },
    dispatch,
  );
};

export default withViewTracking('viesco')(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
