import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { Icon } from '~/framework/components/picture/Icon';
import { BodyBoldText, SmallInverseText, SmallText } from '~/framework/components/text';
import { AsyncState } from '~/framework/util/redux/async';
import { DenseDevoirList } from '~/modules/viescolaire/competences/components/Item';
import competencesConfig from '~/modules/viescolaire/competences/moduleConfig';
import { IDevoirsMatieres, ILevel } from '~/modules/viescolaire/competences/reducer';
import { IHomeworkByDateList } from '~/modules/viescolaire/dashboard/components/DashboardRelative';
import { viescoTheme } from '~/modules/viescolaire/dashboard/utils/viescoTheme';
import { HomeworkItem } from '~/modules/viescolaire/diary/components/Items';
import diaryConfig from '~/modules/viescolaire/diary/moduleConfig';
import { IHomeworkMap } from '~/modules/viescolaire/diary/reducer';
import edtConfig from '~/modules/viescolaire/edt/moduleConfig';
import presencesConfig from '~/modules/viescolaire/presences/moduleConfig';
import { homeworkListDetailsAdapter, isHomeworkDone } from '~/modules/viescolaire/utils/diary';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  dashboardPart: { paddingVertical: UI_SIZES.spacing.minor, paddingHorizontal: UI_SIZES.spacing.medium },
  gridAllModules: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridModulesLine: {
    width: '100%',
  },
  gridButtonContainer: {
    paddingVertical: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.minor,
  },
  gridButton: {
    borderRadius: 5,
  },
  gridButtonTextWidthFull: {
    width: '100%',
  },
  gridButtonTextWidthHalf: {
    width: '50%',
  },
  gridButtonAllModules: {
    justifyContent: 'flex-start',
  },
  gridButtonLineModules: {
    justifyContent: 'center',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: UI_SIZES.spacing.minor,
  },
  gridButtonText: {
    marginLeft: UI_SIZES.spacing.minor,
    textAlign: 'center',
  },
  subtitle: { color: theme.palette.grey.stone },
});

interface IIconButtonProps {
  disabled?: boolean;
  icon: string;
  color: string;
  text: string;
  onPress: () => void;
  nbModules: number;
}

const IconButtonModule = ({ icon, color, text, onPress, nbModules }: IIconButtonProps) => (
  <View style={[styles.gridButtonContainer, nbModules === 4 ? styles.gridButtonTextWidthHalf : styles.gridButtonTextWidthFull]}>
    <TouchableOpacity onPress={onPress} style={[styles.gridButton, { backgroundColor: color }]}>
      <View style={[styles.viewButton, nbModules === 4 ? styles.gridButtonAllModules : styles.gridButtonLineModules]}>
        <Icon size={20} color={theme.ui.text.inverse} name={icon} />
        <SmallInverseText style={styles.gridButtonText}>{text}</SmallInverseText>
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
          <IconButtonModule
            onPress={() =>
              this.props.navigation.navigate(`${presencesConfig.routeName}/history`, {
                user_type: 'Student',
              })
            }
            text={I18n.t('viesco-history')}
            color={viescoTheme.palette.presences}
            icon="access_time"
            nbModules={nbModules}
          />
        )}
        {this.props.authorizedViescoApps.edt && (
          <IconButtonModule
            onPress={() => this.props.navigation.navigate(edtConfig.routeName)}
            text={I18n.t('viesco-timetable')}
            color={viescoTheme.palette.timetable}
            icon="calendar_today"
            nbModules={nbModules}
          />
        )}
        {this.props.authorizedViescoApps.diary && (
          <IconButtonModule
            onPress={() => this.props.navigation.navigate(`${diaryConfig.routeName}/homeworkList`)}
            text={I18n.t('Homework')}
            color={viescoTheme.palette.diary}
            icon="checkbox-multiple-marked"
            nbModules={nbModules}
          />
        )}
        {this.props.authorizedViescoApps.competences && (
          <IconButtonModule
            onPress={() => this.props.navigation.navigate(competencesConfig.routeName)}
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
      .sort()
      .slice(0, 5)
      .reduce(function (memo, current) {
        memo[current] = homeworksByDate[current];
        return memo;
      }, {});

    return (
      <View style={styles.dashboardPart}>
        <BodyBoldText>{I18n.t('viesco-homework')}</BodyBoldText>
        {Object.values(homeworks).length === 0 && (
          <EmptyScreen svgImage="empty-homework" title={I18n.t('viesco-homework-EmptyScreenText')} />
        )}
        {Object.keys(homeworksByDate).map(date => (
          <>
            {moment(date).isAfter(moment()) && (
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
                      this.props.navigation.navigate(
                        `${diaryConfig.routeName}/homework`,
                        homeworkListDetailsAdapter(homework, homeworks),
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
      <View style={styles.mainContainer}>
        {this.renderNavigationGrid()}
        <ScrollView>
          {authorizedViescoApps.diary && this.renderHomework(homeworks.data)}
          {authorizedViescoApps.competences &&
            (evaluations.isFetching ? <LoadingIndicator /> : this.renderEvaluations(evaluations, levels))}
        </ScrollView>
      </View>
    );
  }
}
