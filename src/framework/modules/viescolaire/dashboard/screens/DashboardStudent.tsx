import moment from 'moment';
import * as React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { getSession } from '~/framework/modules/auth/reducer';
import { fetchCompetencesDevoirsAction, fetchCompetencesLevelsAction } from '~/framework/modules/viescolaire/competences/actions';
import { IDevoirsMatieres, ILevel } from '~/framework/modules/viescolaire/competences/model';
import competencesConfig from '~/framework/modules/viescolaire/competences/module-config';
import { fetchPersonnelListAction } from '~/framework/modules/viescolaire/dashboard/actions/personnel';
import { fetchSubjectListAction } from '~/framework/modules/viescolaire/dashboard/actions/subjects';
import DashboardComponent from '~/framework/modules/viescolaire/dashboard/components/DashboardStudent';
import { getSubjectsListState } from '~/framework/modules/viescolaire/dashboard/state/subjects';
import { fetchDiaryHomeworksAction, updateDiaryHomeworkProgressAction } from '~/framework/modules/viescolaire/diary/actions';
import { IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import diaryConfig from '~/framework/modules/viescolaire/diary/module-config';
import { AsyncState } from '~/framework/util/redux/async';

import { IAuthorizedViescoApps } from './home/screen';

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
  const childId = getSession(gs)?.user.id;

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

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
