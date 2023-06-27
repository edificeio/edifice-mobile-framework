import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment, { Moment } from 'moment';
import * as React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import FlatList from '~/framework/components/list/flat-list';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { BodyBoldText, SmallText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { homeworkListDetailsAdapter, isHomeworkDone } from '~/framework/modules/viescolaire/common/utils/diary';
import {
  fetchCompetencesAction,
  fetchCompetencesDevoirsAction,
  fetchCompetencesSubjectsAction,
} from '~/framework/modules/viescolaire/competences/actions';
import { DashboardAssessmentCard } from '~/framework/modules/viescolaire/competences/components/Item';
import { IDevoir } from '~/framework/modules/viescolaire/competences/model';
import competencesConfig from '~/framework/modules/viescolaire/competences/module-config';
import { competencesRouteNames } from '~/framework/modules/viescolaire/competences/navigation';
import { concatDevoirs } from '~/framework/modules/viescolaire/competences/service';
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
import { tryAction } from '~/framework/util/redux/actions';

import styles from './styles';
import type { DashboardStudentScreenDispatchProps, DashboardStudentScreenPrivateProps } from './types';

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
    title: I18n.get('dashboard-student-title'),
  }),
});

class DashboardStudentScreen extends React.PureComponent<DashboardStudentScreenPrivateProps> {
  constructor(props) {
    super(props);
    const { classes, structureId, userId } = props;
    this.state = {
      // fetching next month homeworks only, when screen is focused
      focusListener: this.props.navigation.addListener('focus', () => {
        this.props.tryFetchHomeworks(
          structureId,
          moment().add(1, 'days').format('YYYY-MM-DD'),
          moment().add(1, 'month').format('YYYY-MM-DD'),
        );
        this.props.tryFetchCompetences(userId, classes[0]);
        this.props.tryFetchDevoirs(structureId, userId);
        this.props.tryFetchSubjects(structureId);
      }),
    };
  }

  public componentDidMount() {
    const { structureId } = this.props;
    this.props.tryFetchTeachers(structureId);
  }

  private openAssessment(assessment: IDevoir) {
    const { classes, navigation } = this.props;

    navigation.navigate(competencesRouteNames.assessment, {
      assessment,
      studentClass: classes?.[0] ?? '',
    });
  }

  private renderNavigationGrid() {
    const nbModules = Object.values(this.props.authorizedViescoApps).filter(x => x).length;

    return (
      <View style={[styles.dashboardPart, nbModules === 4 ? styles.gridAllModules : styles.gridModulesLine]}>
        {this.props.authorizedViescoApps.presences && (
          <ModuleIconButton
            onPress={() => this.props.navigation.navigate(presencesRouteNames.history)}
            text={I18n.get('dashboard-student-presences')}
            color={viescoTheme.palette.presences}
            icon="access_time"
            nbModules={nbModules}
          />
        )}
        {this.props.authorizedViescoApps.edt && (
          <ModuleIconButton
            onPress={() => this.props.navigation.navigate(edtRouteNames.home)}
            text={I18n.get('dashboard-student-edt')}
            color={viescoTheme.palette.edt}
            icon="calendar_today"
            nbModules={nbModules}
          />
        )}
        {this.props.authorizedViescoApps.diary && (
          <ModuleIconButton
            onPress={() => this.props.navigation.navigate(diaryRouteNames.homeworkList)}
            text={I18n.get('dashboard-student-diary')}
            color={viescoTheme.palette.diary}
            icon="checkbox-multiple-marked"
            nbModules={nbModules}
          />
        )}
        {this.props.authorizedViescoApps.competences && (
          <ModuleIconButton
            onPress={() => this.props.navigation.navigate(competencesRouteNames.home)}
            text={I18n.get('dashboard-student-competences')}
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

    const tomorrowDate = moment().add(1, 'day') as Moment;

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
        <BodyBoldText>{I18n.get('dashboard-student-homework-recent')}</BodyBoldText>
        {!Object.keys(homeworksByDate).length ? (
          <EmptyScreen svgImage="empty-homework" title={I18n.get('dashboard-student-homework-emptyscreen-title')} />
        ) : null}
        {Object.keys(homeworksByDate).map(date => (
          <>
            <SmallText style={styles.subtitle}>
              {moment(date).isSame(tomorrowDate, 'day')
                ? I18n.get('dashboard-student-homework-duetomorrow')
                : I18n.get('dashboard-student-homework-duedate', { date: moment(date).format('DD/MM/YYYY') })}
            </SmallText>
            {homeworksByDate[date].map(homework => (
              <HomeworkItem
                hideCheckbox={false}
                checked={isHomeworkDone(homework)}
                title={homework.subject_id !== 'exceptional' ? homework.subject.name : homework.exceptional_label}
                subtitle={homework.type}
                onChange={() => {
                  this.props.tryUpdateHomeworkProgress(homework.id, !isHomeworkDone(homework));
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

  private renderLastAssessments() {
    return (
      <FlatList
        data={this.props.devoirs.slice(0, 5)}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <DashboardAssessmentCard
            devoir={item}
            hasCompetences={this.props.competences.some(c => c.devoirId === item.id)}
            subject={this.props.subjects.find(s => s.id === item.subjectId)}
            openAssessment={() => this.openAssessment(item)}
          />
        )}
        ListHeaderComponent={<BodyBoldText>{I18n.get('dashboard-student-assessments-recent')}</BodyBoldText>}
        ListEmptyComponent={
          <EmptyScreen svgImage="empty-evaluations" title={I18n.get('dashboard-student-assessments-emptyscreen-title')} />
        }
        scrollEnabled={false}
        style={styles.dashboardPart}
      />
    );
  }

  scrollRef = React.createRef<typeof ScrollView>();

  public render() {
    const { authorizedViescoApps, homeworks, isFetchingDevoirs } = this.props;

    return (
      <PageView>
        {this.renderNavigationGrid()}
        <ScrollView ref={this.scrollRef}>
          {authorizedViescoApps.diary ? this.renderHomework(homeworks.data) : null}
          {authorizedViescoApps.competences ? isFetchingDevoirs ? <LoadingIndicator /> : this.renderLastAssessments() : null}
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
      classes: session?.user.classes,
      competences: competencesState.competences.data,
      devoirs: concatDevoirs(competencesState.devoirs.data, competencesState.competences.data),
      homeworks: diaryState.homeworks,
      isFetchingDevoirs: competencesState.devoirs.isFetching,
      structureId: session?.user.structures?.[0]?.id,
      subjects: competencesState.subjects.data,
      userId: session?.user.id,
    };
  },
  dispatch =>
    bindActionCreators<DashboardStudentScreenDispatchProps>(
      {
        tryFetchCompetences: tryAction(fetchCompetencesAction),
        tryFetchDevoirs: tryAction(fetchCompetencesDevoirsAction),
        tryFetchHomeworks: tryAction(fetchDiaryHomeworksAction),
        tryFetchSubjects: tryAction(fetchCompetencesSubjectsAction),
        tryFetchTeachers: tryAction(fetchDiaryTeachersAction),
        tryUpdateHomeworkProgress: tryAction(updateDiaryHomeworkProgressAction),
      },
      dispatch,
    ),
)(DashboardStudentScreen);
