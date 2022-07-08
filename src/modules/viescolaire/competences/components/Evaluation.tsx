import AsyncStorage from '@react-native-async-storage/async-storage';
import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { Text, TextBold } from '~/framework/components/text';
import { ILevelsList } from '~/modules/viescolaire/competences/state/competencesLevels';
import { IDevoirsMatieresState } from '~/modules/viescolaire/competences/state/devoirs';
import { IMoyenneListState } from '~/modules/viescolaire/competences/state/moyennes';
import ChildPicker from '~/modules/viescolaire/viesco/containers/ChildPicker';
import { IPeriodsList } from '~/modules/viescolaire/viesco/state/periods';
import { PageContainer } from '~/ui/ContainerContent';
import Dropdown from '~/ui/Dropdown';

import { GradesDevoirs, GradesDevoirsMoyennes, getSortedEvaluationList } from './Item';

const styles = StyleSheet.create({
  subtitle: { color: theme.palette.grey.stone, paddingVertical: UI_SIZES.spacing.minor },
  dashboardPart: { paddingVertical: UI_SIZES.spacing.minor, paddingHorizontal: UI_SIZES.spacing.medium, flex: 1 },
  containerDropdowns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10, // MO-142 use UI_SIZES.spacing here
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
    marginBottom: 10, // MO-142 use UI_SIZES.spacing here
    maxWidth: '50%',
  },
  headerSelectedPeriodText: {
    color: theme.palette.grey.stone,
  },
  headerColorSwitchContainer: {
    marginBottom: 10, // MO-142 use UI_SIZES.spacing here
    flexDirection: 'row',
    alignItems: 'center',
  },
  renderDevoirsByPeriodView: {
    flexDirection: 'row',
    maxWidth: '50%',
  },
  selectedPeriodText: {
    marginBottom: 10, // MO-142 use UI_SIZES.spacing here
  },
});

export type ICompetencesProps = {
  devoirsList: IDevoirsMatieresState;
  devoirsMoyennesList: IMoyenneListState;
  levels: ILevelsList;
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
  DASHBOARD,
  PERIOD,
  DISCIPLINE,
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

  private renderDevoirsByPeriod() {
    const { devoirsMoyennesList } = this.props;
    const { devoirs, selectedPeriod } = this.state;
    return (
      <View style={styles.mainView}>
        <View style={styles.renderDevoirsByPeriodView}>
          <TextBold style={styles.selectedPeriodText} numberOfLines={1}>
            {selectedPeriod.type}
          </TextBold>
          <Text> - {I18n.t('viesco-average').toUpperCase()}</Text>
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
        {screenDisplay === ScreenDisplay.DISCIPLINE && <TextBold numberOfLines={1}>{selectedDiscipline}</TextBold>}
        <View style={styles.headerView}>
          {screenDisplay === ScreenDisplay.DASHBOARD ? (
            <TextBold style={styles.headerGradeText} numberOfLines={1}>
              {I18n.t('viesco-last-grades')}
            </TextBold>
          ) : (
            <Text style={styles.headerSelectedPeriodText}>{selectedPeriod.type}</Text>
          )}
          {isDevoirsNoted ? (
            <View style={styles.headerColorSwitchContainer}>
              <Text>{I18n.t('viesco-colors')}&ensp;</Text>
              <Switch
                trackColor={{ false: '#D1D1D1', true: '#A1DED5' }}
                thumbColor={value ? '#EFEFEF' : '#46BFAF'}
                ios_backgroundColor={value ? '#DDDDDD' : '#46BFAF'}
                onValueChange={() => {
                  this.setState({ switchValue: value ? SwitchState.COLOR : SwitchState.DEFAULT });
                  this.setSwitchDefaultPosition(value);
                }}
                value={!value}
              />
            </View>
          ) : null}
        </View>
      </>
    );
  };

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

  public render() {
    return (
      <PageContainer>
        {this.props.userType === 'Relative' && <ChildPicker hideButton />}
        <View style={styles.dashboardPart}>
          <Text style={styles.subtitle}>{I18n.t('viesco-report-card')}</Text>
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
