import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { NavigationActions } from 'react-navigation';

import { EmptyScreen } from '~/framework/components/emptyScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { Icon } from '~/framework/components/picture/Icon';
import { Text, TextBold, TextSizeStyle } from '~/framework/components/text';
import { HomeworkItem } from '~/modules/viescolaire/cdt/components/Items';
import { IHomework, IHomeworkList, IHomeworkListState } from '~/modules/viescolaire/cdt/state/homeworks';
import { DenseDevoirList } from '~/modules/viescolaire/competences/components/Item';
import { ILevelsList } from '~/modules/viescolaire/competences/state/competencesLevels';
import { IDevoirsMatieresState } from '~/modules/viescolaire/competences/state/devoirs';
import { homeworkListDetailsAdapter, isHomeworkDone } from '~/modules/viescolaire/utils/cdt';
import ChildPicker from '~/modules/viescolaire/viesco/containers/ChildPicker';
import { IAuthorizedViescoApps } from '~/modules/viescolaire/viesco/containers/Dashboard';
import { INavigationProps } from '~/types';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  declareAbscenceText: {
    color: '#FFFFFF',
  },
  dashboardPart: { paddingVertical: 8, paddingHorizontal: 15 },
  gridAllModules: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridModulesLine: {
    width: '100%',
  },
  gridButtonContainer: {
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  gridButton: {
    borderRadius: 5,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  gridButtonText: {
    marginLeft: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  gridButtonTextWidthFull: {
    width: '100%',
  },
  gridButtonTextWidthHalf: {
    width: '50%',
  },
  gridButtonDefaultColor: {
    backgroundColor: '#858FA9',
  },
  gridButtonAllModules: {
    justifyContent: 'flex-start',
  },
  gridButtonLineModules: {
    justifyContent: 'center',
  },
  title: {
    ...TextSizeStyle.SlightBigPlus,
  },
  subtitle: { color: '#AFAFAF' },
  declareAbsenceButton: {
    backgroundColor: '#FCB602',
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignSelf: 'stretch',
    borderRadius: 5,
  },
});

export type IHomeworkByDateList = {
  [key: string]: IHomework[];
};

type IDashboardProps = {
  authorizedViescoApps: IAuthorizedViescoApps;
  userId: string;
  homeworks: IHomeworkListState;
  evaluations: IDevoirsMatieresState;
  levels: ILevelsList;
  hasRightToCreateAbsence: boolean;
} & INavigationProps;

interface IIconButtonProps {
  disabled?: boolean;
  icon: string;
  color: string;
  text: string;
  onPress: () => void;
  nbModules: number;
}

const IconButtonModule = ({ disabled, icon, color, text, onPress, nbModules }: IIconButtonProps) => (
  <View style={[styles.gridButtonContainer, nbModules === 4 ? styles.gridButtonTextWidthHalf : styles.gridButtonTextWidthFull]}>
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[styles.gridButton, disabled ? styles.gridButtonDefaultColor : { backgroundColor: color }]}>
      <View style={[styles.viewButton, nbModules === 4 ? styles.gridButtonAllModules : styles.gridButtonLineModules]}>
        <Icon size={20} color="white" name={icon} />
        <Text style={styles.gridButtonText}>{text}</Text>
      </View>
    </TouchableOpacity>
  </View>
);

export default class Dashboard extends React.PureComponent<IDashboardProps> {
  private renderNavigationGrid() {
    const nbModules = Object.values(this.props.authorizedViescoApps).filter(x => x).length;

    return (
      <View style={[styles.dashboardPart, nbModules === 4 ? styles.gridAllModules : styles.gridModulesLine]}>
        {this.props.authorizedViescoApps.presences && (
          <IconButtonModule
            onPress={() =>
              this.props.navigation.navigate(
                'presences',
                {},
                NavigationActions.navigate({
                  routeName: 'History',
                  params: {
                    user_type: 'Relative',
                    userId: this.props.userId,
                  },
                }),
              )
            }
            text={I18n.t('viesco-history')}
            color="#FCB602"
            icon="access_time"
            nbModules={nbModules}
          />
        )}
        {this.props.authorizedViescoApps.edt && (
          <IconButtonModule
            onPress={() => this.props.navigation.navigate('Timetable')}
            text={I18n.t('viesco-timetable')}
            color="#162EAE"
            icon="calendar_today"
            nbModules={nbModules}
          />
        )}
        {this.props.authorizedViescoApps.diary && (
          <IconButtonModule
            onPress={() => this.props.navigation.navigate('HomeworkList')}
            text={I18n.t('Homework')}
            color="#2BAB6F"
            icon="checkbox-multiple-marked"
            nbModules={nbModules}
          />
        )}
        {this.props.authorizedViescoApps.competences && (
          <IconButtonModule
            onPress={() => this.props.navigation.navigate('EvaluationList')}
            text={I18n.t('viesco-tests')}
            color="#F95303"
            icon="equalizer"
            nbModules={nbModules}
          />
        )}
      </View>
    );
  }

  private renderHomework(homeworks: IHomeworkListState) {
    const homeworkDataList = homeworks.data as IHomeworkList;

    let homeworksByDate = {} as IHomeworkByDateList;
    Object.values(homeworks.data).forEach(hm => {
      const key = moment(hm.due_date).format('YYYY-MM-DD');
      if (typeof homeworksByDate[key] === 'undefined') homeworksByDate[key] = [];
      homeworksByDate[key].push(hm);
    });

    const tomorrowDate = moment().add(1, 'day') as moment.Moment;

    homeworksByDate = Object.keys(homeworksByDate)
      .sort()
      .slice(0, 5)
      .reduce(function (memo, current) {
        memo[current] = homeworksByDate[current];
        return memo;
      }, {});

    return (
      <View style={styles.dashboardPart}>
        <TextBold style={styles.title}>{I18n.t('viesco-homework')}</TextBold>
        {Object.values(homeworks.data).length === 0 && (
          <EmptyScreen svgImage="empty-homework" title={I18n.t('viesco-homework-EmptyScreenText')} />
        )}
        {Object.keys(homeworksByDate).map(date => (
          <>
            {moment(date).isAfter(moment()) && (
              <>
                <Text style={styles.subtitle}>
                  {moment(date).isSame(tomorrowDate, 'day')
                    ? I18n.t('viesco-homework-fortomorrow')
                    : `${I18n.t('viesco-homework-fordate')} ${moment(date).format('DD/MM/YYYY')}`}
                </Text>
                {homeworksByDate[date].map(homework => (
                  <HomeworkItem
                    disabled
                    checked={isHomeworkDone(homework)}
                    title={homework.subject_id !== 'exceptional' ? homework.subject.name : homework.exceptional_label}
                    subtitle={homework.type}
                    onPress={() =>
                      this.props.navigation.navigate(
                        'cdt',
                        {},
                        NavigationActions.navigate({
                          routeName: 'HomeworkPage',
                          params: homeworkListDetailsAdapter(homework, homeworkDataList),
                        }),
                      )
                    }
                  />
                ))}
              </>
            )}
          </>
        ))}
      </View>
    );
  }

  // Get the 5 last added evaluations
  //Sort evaluations by dates, then by alphabetical order then by notes
  getSortedEvaluationList = (evaluations: IDevoirsMatieresState) => {
    return evaluations.data.devoirs
      .sort(
        (a, b) =>
          moment(b.date).diff(moment(a.date)) ||
          String(a.matiere.toLocaleLowerCase() ?? '').localeCompare(b.matiere.toLocaleLowerCase() ?? '') ||
          Number(a.note) - Number(b.note),
      )
      .slice(0, 5);
  };

  private renderLastEval(evaluations: IDevoirsMatieresState, levels: ILevelsList) {
    const evaluationList = evaluations ? this.getSortedEvaluationList(evaluations) : [];
    return (
      <View style={styles.dashboardPart}>
        <TextBold style={styles.title}>{I18n.t('viesco-lasteval')}</TextBold>
        {evaluations && evaluations.data.devoirs.length > 0 ? (
          <DenseDevoirList devoirs={evaluationList} levels={levels} />
        ) : (
          <EmptyScreen svgImage="empty-evaluations" title={I18n.t('viesco-eval-EmptyScreenText')} />
        )}
      </View>
    );
  }

  public render() {
    const { authorizedViescoApps, homeworks, evaluations, hasRightToCreateAbsence, levels } = this.props;

    return (
      <View style={styles.mainContainer}>
        <ChildPicker>
          {hasRightToCreateAbsence && (
            <TouchableOpacity onPress={() => this.props.navigation.navigate('Declaration')} style={styles.declareAbsenceButton}>
              <TextBold style={styles.declareAbscenceText}>{I18n.t('viesco-declareAbsence')}</TextBold>
            </TouchableOpacity>
          )}
        </ChildPicker>

        <ScrollView>
          {this.renderNavigationGrid()}
          {authorizedViescoApps.diary && this.renderHomework(homeworks)}
          {authorizedViescoApps.competences &&
            (evaluations && evaluations.isFetching ? <LoadingIndicator /> : this.renderLastEval(evaluations, levels))}
        </ScrollView>
      </View>
    );
  }
}
