import AsyncStorage from '@react-native-async-storage/async-storage';
import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { Platform, StyleSheet, Switch, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { IDevoirsMatieres, ILevel, IMoyenne } from '~/framework/modules/viescolaire/competences/model';
import { AsyncState } from '~/framework/util/redux/async';
import ChildPicker from '~/modules/viescolaire/dashboard/containers/ChildPicker';
import { IPeriodsList } from '~/modules/viescolaire/dashboard/state/periods';
import { PageContainer } from '~/ui/ContainerContent';
import Dropdown from '~/ui/Dropdown';

import { GradesDevoirs, GradesDevoirsMoyennes, getSortedEvaluationList } from './Item';

const styles = StyleSheet.create({
  subtitle: { color: theme.palette.grey.stone, paddingVertical: UI_SIZES.spacing.minor },
  dashboardPart: {
    paddingTop: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
    flex: 1,
  },
  containerDropdowns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: UI_SIZES.spacing.small,
    marginHorizontal: UI_SIZES.spacing.tiny,
  },
  dropdownStyle: {
    marginRight: UI_SIZES.spacing.tiny,
  },
  mainView: {
    flex: 1,
  },
  headerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerGradeText: {
    marginBottom: UI_SIZES.spacing.minor,
    maxWidth: '50%',
  },
  headerSelectedPeriodText: {
    color: theme.palette.grey.stone,
  },
  headerColorSwitchContainer: {
    marginBottom: UI_SIZES.spacing.small,
    flexDirection: 'row',
    alignItems: 'center',
  },
  renderDevoirsByPeriodView: {
    flexDirection: 'row',
    maxWidth: '50%',
  },
  selectedPeriodText: {
    marginBottom: UI_SIZES.spacing.minor,
  },
});

export type ICompetencesProps = {
  devoirsList: AsyncState<IDevoirsMatieres>;
  devoirsMoyennesList: AsyncState<IMoyenne>;
  levels: ILevel[];
  userType: string;
  periods: IPeriodsList;
  groups: any;
  structureId: string;
  childId: string;
  childClasses: string;
  getDevoirs: (structureId: string, studentId: string, period?: string, matiere?: string) => void;
  getDevoirsMoyennes: (structureId: string, studentId: string, period?: string) => void;
  getPeriods: (structureId: string, groupId: string) => void;
  getLevels: (structureIs: string) => void;
};

enum SwitchState {
  DEFAULT,
  COLOR,
}

enum ScreenDisplay {
  DASHBOARD, // Home (neither period nor discipline selected)
  PERIOD, // Only period selected
  DISCIPLINE, // Discipline selected (with or without period)
}

type ISelectedPeriod = { type: string; value: string | undefined };

type ICompetencesState = {
  devoirs: any;
  disciplineList: any;
  screenDisplay: ScreenDisplay;
  switchValue: SwitchState;
  currentPeriod: ISelectedPeriod;
  selectedDiscipline: string;
  selectedPeriod: ISelectedPeriod;
  disciplineId: string;
};

export default class Competences extends React.PureComponent<ICompetencesProps, ICompetencesState> {
  constructor(props) {
    super(props);

    const { devoirsList } = this.props;
    this.state = {
      devoirs: getSortedEvaluationList(devoirsList.data.devoirs),
      disciplineList: devoirsList.data.matieres,
      screenDisplay: ScreenDisplay.DASHBOARD,
      switchValue: SwitchState.DEFAULT,
      currentPeriod: { type: I18n.t('viesco-competences-period'), value: undefined },
      selectedDiscipline: I18n.t('viesco-competences-disciplines'),
      selectedPeriod: { type: I18n.t('viesco-competences-period'), value: undefined },
      disciplineId: '',
    };
  }

  componentDidMount() {
    this.getSwitchDefaultPosition();
  }

  // Update when changing child with relative account
  componentWillUpdate(nextProps) {
    const { childId } = this.props;
    const { screenDisplay, selectedPeriod } = this.state;

    if (childId !== nextProps.childId) {
      if (screenDisplay === ScreenDisplay.PERIOD) {
        this.props.getDevoirsMoyennes(nextProps.structureId, nextProps.childId, selectedPeriod.value!);
        this.setCurrentPeriod();
      } else {
        this.props.getDevoirs(nextProps.structureId, nextProps.childId, selectedPeriod.value, this.state.disciplineId!);
      }
      this.props.getDevoirs(nextProps.structureId, nextProps.childId, selectedPeriod.value, this.state.disciplineId!);
      this.props.getPeriods(nextProps.structureId, nextProps.childClasses);
      this.props.getLevels(nextProps.structureId);
    }
  }

  componentDidUpdate(prevProps) {
    const { devoirsList, devoirsMoyennesList, periods, groups } = this.props;
    const { devoirs, screenDisplay } = this.state;

    if (periods !== prevProps.periods) this.setCurrentPeriod();
    if (
      groups !== prevProps.groups ||
      (devoirsList.data !== undefined &&
        devoirsList.data.matieres !== prevProps.devoirsList.data.matieres &&
        devoirsList.data.matieres.length > 0)
    ) {
      this.setState({ disciplineList: devoirsList.data.matieres });
    }
    // Update devoirsList after new fetch
    if (prevProps.devoirsList !== devoirs && screenDisplay !== ScreenDisplay.PERIOD && devoirsList && !devoirsList.isFetching) {
      const list = getSortedEvaluationList(devoirsList.data.devoirs);
      this.setState({ devoirs: list });
    } else if (
      prevProps.devoirsMoyennesList !== devoirs &&
      screenDisplay === ScreenDisplay.PERIOD &&
      !devoirsMoyennesList.isFetching
    ) {
      this.setState({ devoirs: devoirsMoyennesList.data });
    }
  }

  getSwitchDefaultPosition = async () => {
    let value = false as boolean;
    const object = await AsyncStorage.getItem('competences-switch-color');
    if (object) value = JSON.parse(object);
    this.setState({ switchValue: value ? SwitchState.COLOR : SwitchState.DEFAULT });
  };

  setSwitchDefaultPosition = async (value: boolean) => {
    await AsyncStorage.setItem('competences-switch-color', JSON.stringify(value));
  };

  setCurrentPeriod = () => {
    let current = { type: I18n.t('viesco-competences-period'), value: undefined } as ISelectedPeriod;
    if (this.state.currentPeriod.type === current.type) {
      this.props.periods.map(({ order, type, id_type, start_date, end_date }) => {
        if (moment().isBetween(start_date, end_date, 'day', '[]')) {
          current = {
            type: `${I18n.t('viesco-competences-period-' + type) + ' ' + order}`,
            value: id_type.toString(),
          };
        }
      });
      this.setState({ currentPeriod: current });
    }
  };

  screenRenderOpt = () => {
    const { selectedPeriod, selectedDiscipline } = this.state;

    if (
      selectedPeriod.type !== I18n.t('viesco-competences-period') &&
      selectedDiscipline === I18n.t('viesco-competences-disciplines')
    ) {
      this.setState({ screenDisplay: ScreenDisplay.PERIOD });
    } else if (selectedDiscipline !== I18n.t('viesco-competences-disciplines')) {
      this.setState({ screenDisplay: ScreenDisplay.DISCIPLINE });
    } else {
      this.setState({ screenDisplay: ScreenDisplay.DASHBOARD });
    }
  };

  // DISPLAY MOYENNES OR NOTES ------------------------------------------------

  private renderDevoirsByPeriod() {
    const { devoirsMoyennesList } = this.props;
    const { devoirs, selectedPeriod } = this.state;
    return (
      <View style={styles.mainView}>
        <View style={styles.renderDevoirsByPeriodView}>
          <SmallBoldText style={styles.selectedPeriodText} numberOfLines={1}>
            {selectedPeriod.type}
          </SmallBoldText>
          <SmallText> - {I18n.t('viesco-average').toUpperCase()}</SmallText>
        </View>
        {devoirsMoyennesList.isFetching ? (
          <LoadingIndicator />
        ) : devoirs !== undefined && devoirs.length > 0 ? (
          <GradesDevoirsMoyennes devoirs={devoirs} />
        ) : (
          <EmptyScreen svgImage="empty-evaluations" title={I18n.t('viesco-eval-EmptyScreenText')} />
        )}
      </View>
    );
  }

  private renderHeaderDevoirsList = () => {
    const { selectedPeriod, selectedDiscipline, screenDisplay, switchValue, devoirs } = this.state;
    // Don't display color Switch if devoirs doesn't have any notes
    let isDevoirsNoted = false as boolean;
    if (devoirs !== undefined) {
      for (const elem of devoirs) {
        if (elem.note !== '' && !isNaN(Number(elem.note))) {
          isDevoirsNoted = true;
          break;
        }
      }
    }
    const value = (switchValue === SwitchState.DEFAULT) as boolean;

    return (
      <>
        {screenDisplay === ScreenDisplay.DISCIPLINE && <SmallBoldText numberOfLines={1}>{selectedDiscipline}</SmallBoldText>}
        <View style={styles.headerView}>
          {screenDisplay === ScreenDisplay.DASHBOARD ? (
            <SmallBoldText style={styles.headerGradeText} numberOfLines={1}>
              {I18n.t('viesco-last-grades')}
            </SmallBoldText>
          ) : (
            <SmallText style={styles.headerSelectedPeriodText}>{selectedPeriod.type}</SmallText>
          )}
          {isDevoirsNoted ? (
            <View style={styles.headerColorSwitchContainer}>
              <SmallText>{I18n.t('viesco-colors')}&ensp;</SmallText>
              <Switch
                value={!value}
                onValueChange={() => {
                  this.setState({ switchValue: value ? SwitchState.COLOR : SwitchState.DEFAULT });
                  this.setSwitchDefaultPosition(value);
                }}
                trackColor={{ false: theme.palette.grey.grey, true: theme.palette.complementary.green.regular }}
                style={Platform.OS !== 'ios' ? { transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] } : null}
              />
            </View>
          ) : null}
        </View>
      </>
    );
  };

  // DISPLAY LOADER OR LIST OF DEVOIRS ----------------------------------------

  private renderDevoirsList() {
    const { devoirsList, levels } = this.props;
    const { devoirs, switchValue } = this.state;

    return (
      <View style={styles.mainView}>
        {this.renderHeaderDevoirsList()}
        {devoirsList && devoirsList.isFetching ? (
          <LoadingIndicator />
        ) : devoirs !== undefined && devoirs.length > 0 && devoirs === devoirsList.data.devoirs ? (
          <GradesDevoirs devoirs={devoirs} color={switchValue !== SwitchState.DEFAULT} levels={levels} />
        ) : (
          <EmptyScreen svgImage="empty-evaluations" title={I18n.t('viesco-eval-EmptyScreenText')} />
        )}
      </View>
    );
  }

  // MANAGE DROPDOWN ----------------------------------------------------------

  private initDevoirsByDisciplines(discipline) {
    const { structureId, childId } = this.props;
    const { selectedPeriod, currentPeriod, disciplineList } = this.state;

    let subjectId = '';
    if (discipline !== I18n.t('viesco-competences-disciplines')) {
      subjectId = this.state.disciplineList.find(item => item.name === discipline)!.id;
      if (selectedPeriod.type === I18n.t('viesco-competences-period')) {
        this.setState({ selectedPeriod: currentPeriod });
        this.props.getDevoirs(structureId, childId, currentPeriod.value!, subjectId);
      } else this.props.getDevoirs(structureId, childId, selectedPeriod.value!, subjectId);
    } else this.props.getDevoirs(structureId, childId);

    if (disciplineList.length >= 1) {
      this.setState({ selectedDiscipline: discipline, disciplineId: subjectId }, this.screenRenderOpt);
    }
  }

  private initDevoirsByPeriods(period: ISelectedPeriod) {
    const { structureId, childId } = this.props;
    const { disciplineId, selectedDiscipline } = this.state;

    if (disciplineId === '' || selectedDiscipline === I18n.t('viesco-competences-disciplines')) {
      this.props.getDevoirsMoyennes(structureId, childId, period.value!);
    } else {
      this.props.getDevoirs(structureId, childId, period.value!, disciplineId);
    }
    this.setState({ selectedPeriod: period }, this.screenRenderOpt);
  }

  private displayDisciplinesDropdown() {
    const disciplines = this.state.disciplineList
      .map(({ name }) => name)
      .sort((a, b) => String(a.toLocaleLowerCase() ?? '').localeCompare(b.toLocaleLowerCase() ?? ''));
    disciplines.unshift(I18n.t('viesco-competences-disciplines'));

    return (
      <Dropdown
        keyId="competences.disciplines"
        data={Object.values(disciplines)}
        value={this.state.selectedDiscipline}
        onSelect={(discipline: string) => this.initDevoirsByDisciplines(discipline)}
        renderItem={(item: string) => item}
      />
    );
  }

  private displayPeriodsDropdown() {
    const { selectedPeriod } = this.state;
    const periodsList = [{ type: I18n.t('viesco-competences-period'), value: undefined }] as ISelectedPeriod[];
    this.props.periods.map(({ order, type, id_type }) =>
      periodsList.push({
        type: `${I18n.t('viesco-competences-period-' + type) + ' ' + order}`,
        value: id_type.toString(),
      }),
    );
    periodsList.push({ type: I18n.t('viesco-year'), value: undefined });

    return (
      <Dropdown
        keyId="competences.periods"
        style={styles.dropdownStyle}
        data={periodsList.map(x => x.type)}
        value={selectedPeriod.type}
        onSelect={(key: string) => {
          const elem = periodsList.find(item => item.type === key);
          if (elem !== undefined && elem.type !== selectedPeriod.type) {
            this.initDevoirsByPeriods(elem);
          }
        }}
        renderItem={(item: string) => item}
      />
    );
  }

  // BASE RENDER --------------------------------------------------------------

  public render() {
    return (
      <PageContainer>
        {this.props.userType === 'Relative' && <ChildPicker />}
        <View style={styles.dashboardPart}>
          <SmallText style={styles.subtitle}>{I18n.t('viesco-report-card')}</SmallText>
          <View style={styles.containerDropdowns}>
            {this.displayPeriodsDropdown()}
            {this.displayDisciplinesDropdown()}
          </View>
          {this.state.screenDisplay === ScreenDisplay.PERIOD ? this.renderDevoirsByPeriod() : this.renderDevoirsList()}
        </View>
      </PageContainer>
    );
  }
}
