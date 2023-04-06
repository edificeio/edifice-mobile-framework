import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { BodyBoldText, SmallText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { homeworkListDetailsAdapter, isHomeworkDone } from '~/framework/modules/viescolaire/common/utils/diary';
import { fetchCompetencesDevoirsAction, fetchCompetencesLevelsAction } from '~/framework/modules/viescolaire/competences/actions';
import { DenseDevoirList } from '~/framework/modules/viescolaire/competences/components/Item';
import { IDevoirsMatieres, ILevel } from '~/framework/modules/viescolaire/competences/model';
import competencesConfig from '~/framework/modules/viescolaire/competences/module-config';
import { competencesRouteNames } from '~/framework/modules/viescolaire/competences/navigation';
import { ModuleIconButton } from '~/framework/modules/viescolaire/dashboard/components/ModuleIconButton';
import { DashboardNavigationParams, dashboardRouteNames } from '~/framework/modules/viescolaire/dashboard/navigation';
import {
  fetchDiaryHomeworksAction,
  fetchDiaryTeachersAction,
  updateDiaryHomeworkProgressAction,
} from '~/framework/modules/viescolaire/diary/actions';
import { HomeworkItem } from '~/framework/modules/viescolaire/diary/components/Items';
import { IHomework, IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import diaryConfig from '~/framework/modules/viescolaire/diary/module-config';
import { diaryRouteNames } from '~/framework/modules/viescolaire/diary/navigation';
import { edtRouteNames } from '~/framework/modules/viescolaire/edt/navigation';
import { presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryActionLegacy } from '~/framework/util/redux/actions';
import { AsyncState } from '~/framework/util/redux/async';

import styles from './styles';
import type { DashboardStudentScreenPrivateProps } from './types';

type IHomeworkByDateList = {
  [key: string]: IHomework[];
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<DashboardNavigationParams, typeof dashboardRouteNames.student>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.t('viesco'),
  }),
});

class DashboardStudentScreen extends React.PureComponent<DashboardStudentScreenPrivateProps> {
  constructor(props) {
    super(props);
    const { structureId, userId } = props;
    this.state = {
      // fetching next month homeworks only, when screen is focused
      focusListener: this.props.navigation.addListener('focus', () => {
        this.props.fetchHomeworks(
          structureId,
          moment().add(1, 'days').format('YYYY-MM-DD'),
          moment().add(1, 'month').format('YYYY-MM-DD'),
        );
        this.props.fetchDevoirs(structureId, userId);
      }),
    };
  }

  public componentDidMount() {
    const { structureId } = this.props;
    this.props.fetchTeachers(structureId);
    this.props.fetchLevels(structureId);
  }

  private renderNavigationGrid() {
    const nbModules = Object.values(this.props.authorizedViescoApps).filter(x => x).length;

    return (
      <View style={[styles.dashboardPart, nbModules === 4 ? styles.gridAllModules : styles.gridModulesLine]}>
        {this.props.authorizedViescoApps.presences && (
          <ModuleIconButton
            onPress={() => this.props.navigation.navigate(presencesRouteNames.history)}
            text={I18n.t('viesco-history')}
            color={viescoTheme.palette.presences}
            icon="access_time"
            nbModules={nbModules}
          />
        )}
        {this.props.authorizedViescoApps.edt && (
          <ModuleIconButton
            onPress={() => this.props.navigation.navigate(edtRouteNames.home)}
            text={I18n.t('viesco-timetable')}
            color={viescoTheme.palette.edt}
            icon="calendar_today"
            nbModules={nbModules}
          />
        )}
        {this.props.authorizedViescoApps.diary && (
          <ModuleIconButton
            onPress={() => this.props.navigation.navigate(diaryRouteNames.homeworkList)}
            text={I18n.t('Homework')}
            color={viescoTheme.palette.diary}
            icon="checkbox-multiple-marked"
            nbModules={nbModules}
          />
        )}
        {this.props.authorizedViescoApps.competences && (
          <ModuleIconButton
            onPress={() => this.props.navigation.navigate(competencesRouteNames.home)}
            text={I18n.t('viesco-tests')}
            color={viescoTheme.palette.competences}
            icon="equalizer"
            nbModules={nbModules}
          />
        )}
      </View>
    );
  }

  private renderHomework(homeworks: IHomeworkMap) {
    let homeworksByDate = {} as IHomeworkByDateList;
    Object.values(homeworks).forEach(hm => {
      const key = moment(hm.due_date).format('YYYY-MM-DD');
      if (typeof homeworksByDate[key] === 'undefined') homeworksByDate[key] = [];
      homeworksByDate[key].push(hm);
    });

    const tomorrowDate = moment().add(1, 'day') as moment.Moment;

    homeworksByDate = Object.keys(homeworksByDate)
      .filter(date => moment(date).isAfter(moment()))
      .sort()
      .slice(0, 5)
      .reduce(function (memo, current) {
        memo[current] = homeworksByDate[current];
        return memo;
      }, {});

    return (
      <View style={styles.dashboardPart}>
        <BodyBoldText>{I18n.t('viesco-homework')}</BodyBoldText>
        {!Object.keys(homeworksByDate).length ? (
          <EmptyScreen svgImage="empty-homework" title={I18n.t('viesco-homework-EmptyScreenText')} />
        ) : null}
        {Object.keys(homeworksByDate).map(date => (
          <>
            <SmallText style={styles.subtitle}>
              {moment(date).isSame(tomorrowDate, 'day')
                ? I18n.t('viesco-homework-fortomorrow')
                : `${I18n.t('viesco-homework-fordate')} ${moment(date).format('DD/MM/YYYY')}`}
            </SmallText>
            {homeworksByDate[date].map(homework => (
              <HomeworkItem
                hideCheckbox={false}
                checked={isHomeworkDone(homework)}
                title={homework.subject_id !== 'exceptional' ? homework.subject.name : homework.exceptional_label}
                subtitle={homework.type}
                onChange={() => {
                  this.props.updateHomeworkProgress(homework.id, !isHomeworkDone(homework));
                }}
                onPress={() =>
                  this.props.navigation.navigate(diaryRouteNames.homework, homeworkListDetailsAdapter(homework, homeworks))
                }
              />
            ))}
          </>
        ))}
      </View>
    );
  }

  // Get the 5 last added evaluations
  //Sort evaluations by dates, then by alphabetical order then by notes
  getSortedEvaluationList = (evaluations: AsyncState<IDevoirsMatieres>) => {
    return evaluations.data.devoirs
      .sort(
        (a, b) =>
          moment(b.date).diff(moment(a.date)) ||
          String(a.matiere.toLocaleLowerCase() ?? '').localeCompare(b.matiere.toLocaleLowerCase() ?? '') ||
          Number(a.note) - Number(b.note),
      )
      .slice(0, 5);
  };

  private renderEvaluations(evaluations: AsyncState<IDevoirsMatieres>, levels: ILevel[]) {
    const evaluationList = this.getSortedEvaluationList(evaluations);
    return (
      <View style={styles.dashboardPart}>
        <BodyBoldText>{I18n.t('viesco-lasteval')}</BodyBoldText>
        {evaluations && evaluations.data.devoirs && evaluationList !== undefined && evaluationList.length > 0 ? (
          <DenseDevoirList devoirs={evaluationList} levels={levels} />
        ) : (
          <EmptyScreen svgImage="empty-evaluations" title={I18n.t('viesco-eval-EmptyScreenText')} />
        )}
      </View>
    );
  }

  public render() {
    const { authorizedViescoApps, homeworks, evaluations, levels } = this.props;

    return (
      <PageView>
        {this.renderNavigationGrid()}
        <ScrollView>
          {authorizedViescoApps.diary && this.renderHomework(homeworks.data)}
          {authorizedViescoApps.competences &&
            (evaluations.isFetching ? <LoadingIndicator /> : this.renderEvaluations(evaluations, levels))}
        </ScrollView>
      </PageView>
    );
  }
}

export default connect(
  (state: IGlobalState) => {
    const competencesState = competencesConfig.getState(state);
    const diaryState = diaryConfig.getState(state);
    const session = getSession();

    return {
      authorizedViescoApps: {
        competences: session?.apps.some(app => app.address === '/competences'),
        diary: session?.apps.some(app => app.address === '/diary'),
        edt: session?.apps.some(app => app.address === '/edt'),
        presences: session?.apps.some(app => app.address === '/presences'),
      },
      evaluations: competencesState.devoirsMatieres,
      homeworks: diaryState.homeworks,
      levels: competencesState.levels.data,
      structureId: session?.user.structures?.[0]?.id,
      userId: session?.user.id,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchDevoirs: tryActionLegacy(
          fetchCompetencesDevoirsAction,
          undefined,
          true,
        ) as unknown as DashboardStudentScreenPrivateProps['fetchDevoirs'],
        fetchHomeworks: tryActionLegacy(
          fetchDiaryHomeworksAction,
          undefined,
          true,
        ) as unknown as DashboardStudentScreenPrivateProps['fetchHomeworks'],
        fetchLevels: tryActionLegacy(
          fetchCompetencesLevelsAction,
          undefined,
          true,
        ) as unknown as DashboardStudentScreenPrivateProps['fetchLevels'],
        fetchTeachers: tryActionLegacy(
          fetchDiaryTeachersAction,
          undefined,
          true,
        ) as unknown as DashboardStudentScreenPrivateProps['fetchTeachers'],
        updateHomeworkProgress: tryActionLegacy(
          updateDiaryHomeworkProgressAction,
          undefined,
          true,
        ) as unknown as DashboardStudentScreenPrivateProps['updateHomeworkProgress'],
      },
      dispatch,
    ),
)(DashboardStudentScreen);
