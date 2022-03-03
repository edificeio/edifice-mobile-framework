import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NavigationActions } from 'react-navigation';

import { IHomeworkByDateList } from './DashboardRelative';

import { TextBold } from '~/framework/components/text';
import { HomeworkItem } from '~/modules/viescolaire/cdt/components/Items';
import { IHomeworkList } from '~/modules/viescolaire/cdt/state/homeworks';
import { DenseDevoirList } from '~/modules/viescolaire/competences/components/Item';
import { ILevelsList } from '~/modules/viescolaire/competences/state/competencesLevels';
import { IDevoirsMatieresState } from '~/modules/viescolaire/competences/state/devoirs';
import { isHomeworkDone, homeworkListDetailsAdapter } from '~/modules/viescolaire/utils/cdt';
import { Icon, Loading } from '~/ui';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import EmptyEvaluations from 'ode-images/empty-screen/empty-evaluations.svg';
import EmptyHomework from 'ode-images/empty-screen/empty-homework.svg';

const styles = StyleSheet.create({
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
  title: { fontSize: 18 },
  subtitle: { color: '#AFAFAF' },
  homeworks: {},
  evaluations: {},
});

interface IIconButtonProps {
  disabled?: boolean;
  icon: string;
  color: string;
  text: string;
  onPress: () => void;
  nbModules: number;
}

const IconButton = ({ disabled, icon, color, text, onPress, nbModules }: IIconButtonProps) => (
  <View style={[styles.gridButtonContainer, { width: nbModules === 4 ? '50%' : '100%' }]}>
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[styles.gridButton, { backgroundColor: disabled ? '#858FA9' : color }]}>
      <View style={[styles.viewButton, { justifyContent: nbModules === 4 ? 'flex-start' : 'center' }]}>
        <Icon size={20} color="white" name={icon} />
        <Text style={styles.gridButtonText}>{text}</Text>
      </View>
    </TouchableOpacity>
  </View>
);

export default class Dashboard extends React.PureComponent<any> {
  private renderNavigationGrid() {
    const nbModules = Object.values(this.props.authorizedViescoApps).filter(x => x).length;

    return (
      <View style={[styles.dashboardPart, nbModules === 4 ? styles.gridAllModules : styles.gridModulesLine]}>
        {this.props.authorizedViescoApps.presences && (
          <IconButton
            onPress={() =>
              this.props.navigation.navigate(
                'presences',
                {},
                NavigationActions.navigate({
                  routeName: 'History',
                  params: {
                    user_type: 'Student',
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
          <IconButton
            onPress={() => this.props.navigation.navigate('Timetable')}
            text={I18n.t('viesco-timetable')}
            color="#162EAE"
            icon="calendar_today"
            nbModules={nbModules}
          />
        )}
        {this.props.authorizedViescoApps.diary && (
          <IconButton
            onPress={() => this.props.navigation.navigate('HomeworkList')}
            text={I18n.t('Homework')}
            color="#2BAB6F"
            icon="checkbox-multiple-marked"
            nbModules={nbModules}
          />
        )}
        {this.props.authorizedViescoApps.competences && (
          <IconButton
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

  private renderHomework(homeworks: IHomeworkList) {
    let homeworksByDate = {} as IHomeworkByDateList;
    Object.values(homeworks).forEach(hm => {
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
        {Object.values(homeworks).length === 0 && (
          <EmptyScreen svgImage={<EmptyHomework />} title={I18n.t('viesco-homework-EmptyScreenText')} />
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
                    hideCheckbox={false}
                    checked={isHomeworkDone(homework)}
                    title={homework.subject_id !== 'exceptional' ? homework.subject.name : homework.exceptional_label}
                    subtitle={homework.type}
                    onChange={() => {
                      this.props.updateHomeworkProgress(homework.id, !isHomeworkDone(homework));
                    }}
                    onPress={() =>
                      this.props.navigation.navigate(
                        'cdt',
                        {},
                        NavigationActions.navigate({
                          routeName: 'HomeworkPage',
                          params: homeworkListDetailsAdapter(homework, homeworks),
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

  private renderEvaluations(evaluations: IDevoirsMatieresState, levels: ILevelsList) {
    const evaluationList = this.getSortedEvaluationList(evaluations);
    return (
      <View style={styles.dashboardPart}>
        <TextBold style={styles.title}>{I18n.t('viesco-lasteval')}</TextBold>
        {evaluations && evaluations.data.devoirs && evaluationList !== undefined ? (
          <DenseDevoirList devoirs={evaluationList} levels={levels} />
        ) : (
          <EmptyScreen svgImage={<EmptyEvaluations />} title={I18n.t('viesco-eval-EmptyScreenText')} />
        )}
      </View>
    );
  }

  public render() {
    const { authorizedViescoApps, homeworks, evaluations, levels } = this.props;

    return (
      <View style={{ flex: 1 }}>
        {this.renderNavigationGrid()}
        <ScrollView>
          {authorizedViescoApps.diary && this.renderHomework(homeworks.data)}
          {authorizedViescoApps.competences && (evaluations.isFetching ? <Loading /> : this.renderEvaluations(evaluations, levels))}
        </ScrollView>
      </View>
    );
  }
}
