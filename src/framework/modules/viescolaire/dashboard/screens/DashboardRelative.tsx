import moment from 'moment';
import * as React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import { getSession } from '~/framework/modules/auth/reducer';
import { fetchCompetencesDevoirsAction, fetchCompetencesLevelsAction } from '~/framework/modules/viescolaire/competences/actions';
import { IDevoirsMatieres, ILevel } from '~/framework/modules/viescolaire/competences/model';
import competencesConfig from '~/framework/modules/viescolaire/competences/module-config';
import { fetchPersonnelListAction } from '~/framework/modules/viescolaire/dashboard/actions/personnel';
import DashboardComponent from '~/framework/modules/viescolaire/dashboard/components/DashboardRelative';
import { getSelectedChild, getSelectedChildStructure } from '~/framework/modules/viescolaire/dashboard/state/children';
import { fetchDiaryHomeworksFromChildAction } from '~/framework/modules/viescolaire/diary/actions';
import { IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import diaryConfig from '~/framework/modules/viescolaire/diary/module-config';
import { AsyncState } from '~/framework/util/redux/async';

import { IAuthorizedViescoApps } from './home/screen';

type IDashboardContainerProps = {
  authorizedViescoApps: IAuthorizedViescoApps;
  userId: string;
  homeworks: AsyncState<IHomeworkMap>;
  evaluations: AsyncState<IDevoirsMatieres>;
  hasRightToCreateAbsence: boolean;
  structureId: string;
  childId: string;
  levels: ILevel[];
  getHomeworks: (childId: string, structureId: string, startDate: string, endDate: string) => void;
  getDevoirs: (structureId: string, childId: string) => void;
  getTeachers: (structureId: string) => void;
  getLevels: (structureId: string) => void;
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

    this.props.getTeachers(this.props.structureId);
    this.props.getHomeworks(
      childId,
      structureId,
      moment().add(1, 'day').format('YYYY-MM-DD'),
      moment().add(1, 'month').format('YYYY-MM-DD'),
    );
    this.props.getDevoirs(structureId, childId);
    this.props.getLevels(structureId);
  }

  public componentDidUpdate(prevProps) {
    const { childId, structureId, isFocused } = this.props;

    if (prevProps.childId !== childId) {
      this.props.getTeachers(this.props.structureId);
      this.props.getLevels(structureId);
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

const mapStateToProps = (state: IGlobalState): any => {
  const session = getSession(state);
  const competencesState = competencesConfig.getState(state);
  const diaryState = diaryConfig.getState(state);
  const childId = getSelectedChild(state)?.id;
  const structureId = getSelectedChildStructure(state)?.id;

  return {
    userId: session?.user.id,
    homeworks: diaryState.homeworks,
    evaluations: competencesState.devoirsMatieres,
    hasRightToCreateAbsence: session?.authorizedActions.some(
      action => action.displayName === 'presences.absence.statements.create',
    ),
    structureId,
    childId,
    levels: competencesState.levels.data,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      getTeachers: fetchPersonnelListAction,
      getHomeworks: fetchDiaryHomeworksFromChildAction,
      getDevoirs: fetchCompetencesDevoirsAction,
      getLevels: fetchCompetencesLevelsAction,
    },
    dispatch,
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
