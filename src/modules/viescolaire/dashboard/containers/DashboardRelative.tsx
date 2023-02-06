import moment from 'moment';
import * as React from 'react';
import { NavigationScreenProp, withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { fetchCompetencesDevoirsAction, fetchCompetencesLevelsAction } from '~/framework/modules/viescolaire/competences/actions';
import { IDevoirsMatieres, ILevel } from '~/framework/modules/viescolaire/competences/model';
import competencesConfig from '~/framework/modules/viescolaire/competences/module-config';
import { fetchDiaryHomeworksFromChildAction } from '~/framework/modules/viescolaire/diary/actions';
import { IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import diaryConfig from '~/framework/modules/viescolaire/diary/module-config';
import { AsyncState } from '~/framework/util/redux/async';
import { getUserSession } from '~/framework/util/session';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { fetchChildrenGroupsAction } from '~/modules/viescolaire/dashboard/actions/childrenGroups';
import { fetchPersonnelListAction } from '~/modules/viescolaire/dashboard/actions/personnel';
import { fetchSubjectListAction } from '~/modules/viescolaire/dashboard/actions/subjects';
import DashboardComponent from '~/modules/viescolaire/dashboard/components/DashboardRelative';
import { IAuthorizedViescoApps } from '~/modules/viescolaire/dashboard/containers/Dashboard';
import { getSelectedChild, getSelectedChildStructure } from '~/modules/viescolaire/dashboard/state/children';
import { getSubjectsListState } from '~/modules/viescolaire/dashboard/state/subjects';

type IDashboardContainerProps = {
  authorizedViescoApps: IAuthorizedViescoApps;
  userId: string;
  homeworks: AsyncState<IHomeworkMap>;
  evaluations: AsyncState<IDevoirsMatieres>;
  hasRightToCreateAbsence: boolean;
  structureId: string;
  childId: string;
  levels: ILevel[];
  getSubjects: (structureId: string) => void;
  getHomeworks: (childId: string, structureId: string, startDate: string, endDate: string) => void;
  getDevoirs: (structureId: string, childId: string) => void;
  getTeachers: (structureId: string) => void;
  getLevels: (structureId: string) => void;
  getChildrenGroups: (structureId: string) => void;
  navigation: NavigationScreenProp<any>;
  isFocused: boolean;
};

type IDashboardContainerState = {
  notificationModal: boolean;
};

class Dashboard extends React.PureComponent<IDashboardContainerProps, IDashboardContainerState> {
  constructor(props) {
    super(props);

    this.state = {
      notificationModal: true,
    };
  }

  public componentDidMount() {
    const { childId, structureId } = this.props;

    this.props.getSubjects(this.props.structureId);
    this.props.getTeachers(this.props.structureId);
    this.props.getHomeworks(
      childId,
      structureId,
      moment().add(1, 'day').format('YYYY-MM-DD'),
      moment().add(1, 'month').format('YYYY-MM-DD'),
    );
    this.props.getDevoirs(structureId, childId);
    this.props.getLevels(structureId);
    this.props.getChildrenGroups(structureId);
  }

  public componentDidUpdate(prevProps) {
    const { childId, structureId, isFocused } = this.props;

    if (prevProps.childId !== childId) {
      this.props.getSubjects(this.props.structureId);
      this.props.getTeachers(this.props.structureId);
      this.props.getLevels(structureId);
      this.props.getChildrenGroups(structureId);
    }
    if (isFocused && (prevProps.isFocused !== isFocused || prevProps.childId !== childId)) {
      this.props.getHomeworks(
        childId,
        structureId,
        moment().add(1, 'day').format('YYYY-MM-DD'),
        moment().add(1, 'month').format('YYYY-MM-DD'),
      );
      this.props.getDevoirs(structureId, childId);
    }
  }

  onCloseNotificationModal = () => this.setState({ notificationModal: false });

  public render() {
    return (
      <>
        <DashboardComponent {...this.props} />
        {/*this.props.authorizedViescoApps.presences ? (
          <NotificationRelativesModal showModal={this.state.notificationModal} onClose={this.onCloseNotificationModal} />
        ) : null*/}
      </>
    );
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps = (gs: any): any => {
  const competencesState = competencesConfig.getState(gs);
  const diaryState = diaryConfig.getState(gs);
  const userId = getUserSession().user.id;
  const childId = getSelectedChild(gs).id;
  const subjects = getSubjectsListState(gs);
  const structureId = getSelectedChildStructure(gs)?.id;

  const authorizedActions = gs.user.info.authorizedActions;
  const hasRightToCreateAbsence =
    authorizedActions && authorizedActions.some(action => action.displayName === 'presences.absence.statements.create');

  return {
    userId,
    homeworks: diaryState.homeworks,
    evaluations: competencesState.devoirsMatieres,
    hasRightToCreateAbsence,
    structureId,
    childId,
    subjects,
    levels: competencesState.levels.data,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      getSubjects: fetchSubjectListAction,
      getTeachers: fetchPersonnelListAction,
      getHomeworks: fetchDiaryHomeworksFromChildAction,
      getDevoirs: fetchCompetencesDevoirsAction,
      getLevels: fetchCompetencesLevelsAction,
      getChildrenGroups: fetchChildrenGroupsAction,
    },
    dispatch,
  );
};

export default withViewTracking('viesco')(connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Dashboard)));
