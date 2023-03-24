import AsyncStorage from '@react-native-async-storage/async-storage';
import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { Platform, StyleSheet, Switch, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { CompetencesHomeScreenProps } from '~/framework/modules/viescolaire/competences/screens/home';
import Dropdown from '~/ui/Dropdown';

import { GradesDevoirs, GradesDevoirsMoyennes, getSortedEvaluationList } from './Item';

const styles = StyleSheet.create({
  headerText: {
    marginHorizontal: UI_SIZES.spacing.medium,
    marginTop: UI_SIZES.spacing.small,
  },
  dropdownsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: UI_SIZES.spacing.medium,
    marginTop: UI_SIZES.spacing.small,
  },
  dropdownMargin: {
    marginRight: UI_SIZES.spacing.minor,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: UI_SIZES.spacing.medium,
    marginVertical: UI_SIZES.spacing.small,
  },
  headerGradeText: {
    maxWidth: '50%',
  },
  headerSelectedTermText: {
    color: theme.ui.text.light,
  },
  headerColorSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  renderDevoirsByTermView: {
    flexDirection: 'row',
    maxWidth: '50%',
    marginHorizontal: UI_SIZES.spacing.medium,
    marginTop: UI_SIZES.spacing.small,
  },
  selectedTermText: {
    marginBottom: UI_SIZES.spacing.minor,
  },
});

enum SwitchState {
  DEFAULT,
  COLOR,
}

enum ScreenDisplay {
  DASHBOARD, // Home (neither period nor discipline selected)
  TERM, // Only period selected
  DISCIPLINE, // Discipline selected (with or without period)
}

type ISelectedTerm = { type: string; value: string | undefined };

type ICompetencesState = {
  devoirs: any;
  disciplineList: any;
  screenDisplay: ScreenDisplay;
  switchValue: SwitchState;
  currentTerm: ISelectedTerm;
  selectedDiscipline: string;
  selectedTerm: ISelectedTerm;
  disciplineId: string;
};

export default class Competences extends React.PureComponent<CompetencesHomeScreenProps, ICompetencesState> {
  constructor(props) {
    super(props);

    const { devoirsMatieres } = this.props;
    this.state = {
      devoirs: getSortedEvaluationList(devoirsMatieres.data.devoirs),
      disciplineList: devoirsMatieres.data.matieres,
      screenDisplay: ScreenDisplay.DASHBOARD,
      switchValue: SwitchState.DEFAULT,
      currentTerm: { type: I18n.t('viesco-competences-period'), value: undefined },
      selectedDiscipline: I18n.t('viesco-competences-disciplines'),
      selectedTerm: { type: I18n.t('viesco-competences-period'), value: undefined },
      disciplineId: '',
    };
  }

  componentDidMount() {
    this.getSwitchDefaultPosition();
  }

  // Update when changing child with relative account
  componentWillUpdate(nextProps) {
    const { childId } = this.props;
    const { screenDisplay, selectedTerm } = this.state;

    if (childId !== nextProps.childId) {
      if (screenDisplay === ScreenDisplay.TERM) {
        this.props.fetchMoyennes(nextProps.structureId, nextProps.childId, selectedTerm.value!);
        this.setCurrentTerm();
      } else {
        this.props.fetchDevoirs(nextProps.structureId, nextProps.childId, selectedTerm.value, this.state.disciplineId!);
      }
      this.props.fetchDevoirs(nextProps.structureId, nextProps.childId, selectedTerm.value, this.state.disciplineId!);
      this.props.fetchTerms(nextProps.structureId, nextProps.childClasses);
      this.props.fetchLevels(nextProps.structureId);
    }
  }

  componentDidUpdate(prevProps) {
    const { devoirsMatieres, moyennes, terms } = this.props;
    const { devoirs, screenDisplay } = this.state;

    if (terms !== prevProps.terms) this.setCurrentTerm();
    if (
      devoirsMatieres.data !== undefined &&
      devoirsMatieres.data.matieres !== prevProps.devoirsMatieres.data.matieres &&
      devoirsMatieres.data.matieres.length > 0
    ) {
      this.setState({ disciplineList: devoirsMatieres.data.matieres });
    }
    // Update devoirsMatieres after new fetch
    if (
      prevProps.devoirsMatieres !== devoirs &&
      screenDisplay !== ScreenDisplay.TERM &&
      devoirsMatieres &&
      !devoirsMatieres.isFetching
    ) {
      const list = getSortedEvaluationList(devoirsMatieres.data.devoirs);
      this.setState({ devoirs: list });
    } else if (prevProps.moyennes !== devoirs && screenDisplay === ScreenDisplay.TERM && !moyennes.isFetching) {
      this.setState({ devoirs: moyennes.data });
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

  setCurrentTerm = () => {
    let current = { type: I18n.t('viesco-competences-period'), value: undefined } as ISelectedTerm;
    if (this.state.currentTerm.type === current.type) {
      this.props.terms.map(({ order, type, typeId, startDate, endDate }) => {
        if (moment().isBetween(startDate, endDate, 'day', '[]')) {
          current = {
            type: `${I18n.t('viesco-competences-period-' + type) + ' ' + order}`,
            value: typeId.toString(),
          };
        }
      });
      this.setState({ currentTerm: current });
    }
  };

  screenRenderOpt = () => {
    const { selectedTerm, selectedDiscipline } = this.state;

    if (
      selectedTerm.type !== I18n.t('viesco-competences-period') &&
      selectedDiscipline === I18n.t('viesco-competences-disciplines')
    ) {
      this.setState({ screenDisplay: ScreenDisplay.TERM });
    } else if (selectedDiscipline !== I18n.t('viesco-competences-disciplines')) {
      this.setState({ screenDisplay: ScreenDisplay.DISCIPLINE });
    } else {
      this.setState({ screenDisplay: ScreenDisplay.DASHBOARD });
    }
  };

  // DISPLAY MOYENNES OR NOTES ------------------------------------------------

  private renderDevoirsByTerm() {
    const { moyennes } = this.props;
    const { devoirs, selectedTerm } = this.state;
    return (
      <View style={UI_STYLES.flex1}>
        <View style={styles.renderDevoirsByTermView}>
          <SmallBoldText style={styles.selectedTermText} numberOfLines={1}>
            {selectedTerm.type}
          </SmallBoldText>
          <SmallText> - {I18n.t('viesco-average').toUpperCase()}</SmallText>
        </View>
        {moyennes.isFetching ? (
          <LoadingIndicator />
        ) : devoirs !== undefined && devoirs.length > 0 ? (
          <GradesDevoirsMoyennes devoirs={devoirs} />
        ) : (
          <EmptyScreen svgImage="empty-evaluations" title={I18n.t('viesco-eval-EmptyScreenText')} />
        )}
      </View>
    );
  }

  private renderHeaderDevoirsMatieres = () => {
    const { selectedTerm, selectedDiscipline, screenDisplay, switchValue, devoirs } = this.state;
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
        <View style={styles.headerContainer}>
          <View style={UI_STYLES.flex1}>
            {screenDisplay === ScreenDisplay.DISCIPLINE ? (
              <SmallBoldText numberOfLines={1}>{selectedDiscipline}</SmallBoldText>
            ) : null}
            {screenDisplay === ScreenDisplay.DASHBOARD ? (
              <SmallBoldText style={styles.headerGradeText} numberOfLines={1}>
                {I18n.t('viesco-last-grades')}
              </SmallBoldText>
            ) : (
              <SmallText style={styles.headerSelectedTermText}>{selectedTerm.type}</SmallText>
            )}
          </View>
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

  private renderDevoirsMatieres() {
    const { devoirsMatieres, levels } = this.props;
    const { devoirs, switchValue } = this.state;

    return (
      <View style={UI_STYLES.flex1}>
        {this.renderHeaderDevoirsMatieres()}
        {devoirsMatieres && devoirsMatieres.isFetching ? (
          <LoadingIndicator />
        ) : devoirs !== undefined && devoirs.length > 0 && devoirs === devoirsMatieres.data.devoirs ? (
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
    const { selectedTerm, currentTerm, disciplineList } = this.state;

    let subjectId = '';
    if (discipline !== I18n.t('viesco-competences-disciplines')) {
      subjectId = this.state.disciplineList.find(item => item.name === discipline)!.id;
      if (selectedTerm.type === I18n.t('viesco-competences-period')) {
        this.setState({ selectedTerm: currentTerm });
        this.props.fetchDevoirs(structureId, childId, currentTerm.value!, subjectId);
      } else this.props.fetchDevoirs(structureId, childId, selectedTerm.value!, subjectId);
    } else this.props.fetchDevoirs(structureId, childId);

    if (disciplineList.length >= 1) {
      this.setState({ selectedDiscipline: discipline, disciplineId: subjectId }, this.screenRenderOpt);
    }
  }

  private initDevoirsByTerm(term: ISelectedTerm) {
    const { structureId, childId } = this.props;
    const { disciplineId, selectedDiscipline } = this.state;

    if (disciplineId === '' || selectedDiscipline === I18n.t('viesco-competences-disciplines')) {
      this.props.fetchMoyennes(structureId, childId, term.value!);
    } else {
      this.props.fetchDevoirs(structureId, childId, term.value!, disciplineId);
    }
    this.setState({ selectedTerm: term }, this.screenRenderOpt);
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

  private displayTermsDropdown() {
    const { selectedTerm } = this.state;
    const termsList = [{ type: I18n.t('viesco-competences-period'), value: undefined }] as ISelectedTerm[];
    this.props.terms.map(({ order, type, typeId }) =>
      termsList.push({
        type: `${I18n.t('viesco-competences-period-' + type) + ' ' + order}`,
        value: typeId.toString(),
      }),
    );
    termsList.push({ type: I18n.t('viesco-year'), value: undefined });

    return (
      <Dropdown
        keyId="competences.periods"
        style={styles.dropdownMargin}
        data={termsList.map(x => x.type)}
        value={selectedTerm.type}
        onSelect={(key: string) => {
          const elem = termsList.find(item => item.type === key);
          if (elem !== undefined && elem.type !== selectedTerm.type) {
            this.initDevoirsByTerm(elem);
          }
        }}
        renderItem={(item: string) => item}
      />
    );
  }

  public render() {
    return (
      <View style={UI_STYLES.flex1}>
        <SmallText style={styles.headerText}>{I18n.t('viesco-report-card')}</SmallText>
        <View style={styles.dropdownsContainer}>
          {this.displayTermsDropdown()}
          {this.displayDisciplinesDropdown()}
        </View>
        {this.state.screenDisplay === ScreenDisplay.TERM ? this.renderDevoirsByTerm() : this.renderDevoirsMatieres()}
      </View>
    );
  }
}
