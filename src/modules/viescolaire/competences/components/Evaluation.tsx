import AsyncStorage from "@react-native-async-storage/async-storage";
import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, Switch } from "react-native";

import { Loading } from "../../../../ui";
import { PageContainer } from "../../../../ui/ContainerContent";
import Dropdown from "../../../../ui/Dropdown";
import { EmptyScreen } from "../../../../ui/EmptyScreen";
import { Text, TextBold } from "../../../../framework/components/text";
import ChildPicker from "../../viesco/containers/ChildPicker";
import { IPeriodsList } from "../../viesco/state/periods";
import { ILevelsList } from "../state/competencesLevels";
import { IDevoirsMatieresState } from "../state/devoirs";
import { IMoyenneListState } from "../state/moyennes";
import { getSortedEvaluationList, GradesDevoirs, GradesDevoirsMoyennes } from "./Item";

// eslint-disable-next-line flowtype/no-types-missing-file-annotation
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
      currentPeriod: { type: I18n.t("viesco-competences-period"), value: undefined },
      selectedDiscipline: I18n.t("viesco-competences-disciplines"),
      selectedPeriod: { type: I18n.t("viesco-competences-period"), value: undefined },
      disciplineId: "",
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
      (devoirsList.data.matieres !== prevProps.devoirsList.data.matieres && devoirsList.data.matieres.length > 0)
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
    let object = await AsyncStorage.getItem("competences-switch-color");
    if (object) value = JSON.parse(object);
    this.setState({ switchValue: value ? SwitchState.COLOR : SwitchState.DEFAULT });
  };

  setSwitchDefaultPosition = async (value: boolean) => {
    await AsyncStorage.setItem("competences-switch-color", JSON.stringify(value));
  };

  setCurrentPeriod = () => {
    let current = { type: I18n.t("viesco-competences-period"), value: undefined } as ISelectedPeriod;
    if (this.state.currentPeriod.type === current.type) {
      this.props.periods.map(({ order, type, id_type, start_date, end_date }) => {
        if (moment().isAfter(start_date) && moment().isBefore(end_date)) {
          current = {
            type: `${I18n.t("viesco-competences-period-" + type) + " " + order}`,
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
      selectedPeriod.type !== I18n.t("viesco-competences-period") &&
      selectedDiscipline === I18n.t("viesco-competences-disciplines")
    ) {
      this.setState({ screenDisplay: ScreenDisplay.PERIOD });
    } else if (selectedDiscipline !== I18n.t("viesco-competences-disciplines")) {
      this.setState({ screenDisplay: ScreenDisplay.DISCIPLINE });
    } else {
      this.setState({ screenDisplay: ScreenDisplay.DASHBOARD });
    }
  };

  private renderDevoirsByPeriod() {
    const { devoirsMoyennesList } = this.props;
    const { devoirs, selectedPeriod } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", maxWidth: "50%" }}>
          <TextBold style={{ marginBottom: 10 }} numberOfLines={1}>
            {selectedPeriod.type}
          </TextBold>
          <Text> - {I18n.t("viesco-average").toUpperCase()}</Text>
        </View>
        {devoirsMoyennesList.isFetching ? (
          <Loading />
        ) : devoirs !== undefined && devoirs.length > 0 ? (
          <GradesDevoirsMoyennes devoirs={devoirs} />
        ) : (
          <EmptyScreen
            imageSrc={require("ASSETS/images/empty-screen/empty-evaluations.png")}
            imgWidth={265}
            imgHeight={280}
            title={I18n.t("viesco-eval-EmptyScreenText")}
          />
        )}
      </View>
    );
  }

  private renderHeaderDevoirsList = () => {
    const { selectedPeriod, selectedDiscipline, screenDisplay, switchValue } = this.state;
    let value = (switchValue === SwitchState.DEFAULT) as boolean;
    return (
      <>
        {screenDisplay === ScreenDisplay.DISCIPLINE && <TextBold numberOfLines={1}>{selectedDiscipline}</TextBold>}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {screenDisplay === ScreenDisplay.DASHBOARD ? (
            <TextBold style={{ marginBottom: 10, maxWidth: "50%" }} numberOfLines={1}>{I18n.t("viesco-last-grades")}</TextBold>
          ) : (
            <Text style={{ color: "#AFAFAF" }}>{selectedPeriod.type}</Text>
          )}
          <View style={{ marginBottom: 10, flexDirection: "row", alignItems: "center" }}>
            <Text>{I18n.t("viesco-colors")}&ensp;</Text>
            <Switch
              trackColor={{ false: "#D1D1D1", true: "#A1DED5" }}
              thumbColor={value ? "#EFEFEF" : "#46BFAF"}
              ios_backgroundColor={value ? "#DDDDDD" : "#46BFAF"}
              onValueChange={() => {
                this.setState({ switchValue: value ? SwitchState.COLOR : SwitchState.DEFAULT });
                this.setSwitchDefaultPosition(value);
              }}
              value={!value}
            />
          </View>
        </View>
      </>
    );
  };

  private renderDevoirsList() {
    const { devoirsList, levels } = this.props;
    const { devoirs, switchValue } = this.state;

    return (
      <View style={{ flex: 1 }}>
        {this.renderHeaderDevoirsList()}
        {devoirsList && devoirsList.isFetching ? (
          <Loading />
        ) : devoirs !== undefined && devoirs.length > 0 && devoirs === devoirsList.data.devoirs ? (
          <GradesDevoirs devoirs={devoirs} color={switchValue !== SwitchState.DEFAULT} levels={levels} />
        ) : (
          <EmptyScreen
            imageSrc={require("ASSETS/images/empty-screen/empty-evaluations.png")}
            imgWidth={265}
            imgHeight={280}
            title={I18n.t("viesco-eval-EmptyScreenText")}
          />
        )}
      </View>
    );
  }

  private initDevoirsByDisciplines(discipline) {
    const { structureId, childId } = this.props;
    const { selectedPeriod, currentPeriod, disciplineList } = this.state;

    let subjectId = "";
    if (discipline !== I18n.t("viesco-competences-disciplines")) {
      subjectId = this.state.disciplineList.find(item => item.name === discipline)!.id;
      if (selectedPeriod.type === I18n.t("viesco-competences-period")) {
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

    if (disciplineId === "" || selectedDiscipline === I18n.t("viesco-competences-disciplines")) {
      this.props.getDevoirsMoyennes(structureId, childId, period.value!);
    } else {
      this.props.getDevoirs(structureId, childId, period.value!, disciplineId);
    }
    this.setState({ selectedPeriod: period }, this.screenRenderOpt);
  }

  private displayDisciplinesDropdown() {
    let disciplines = this.state.disciplineList
      .map(({ name }) => name)
      .sort((a, b) => String(a.toLocaleLowerCase() ?? "").localeCompare(b.toLocaleLowerCase() ?? ""));
    disciplines.unshift(I18n.t("viesco-competences-disciplines"));

    return (
      <Dropdown
        data={Object.values(disciplines)}
        value={this.state.selectedDiscipline}
        onSelect={(discipline: string) => this.initDevoirsByDisciplines(discipline)}
        renderItem={(item: string) => item}
      />
    );
  }

  private displayPeriodsDropdown() {
    const { selectedPeriod } = this.state;
    let periodsList = [{ type: I18n.t("viesco-competences-period"), value: undefined }] as ISelectedPeriod[];
    this.props.periods.map(({ order, type, id_type }) =>
      periodsList.push({
        type: `${I18n.t("viesco-competences-period-" + type) + " " + order}`,
        value: id_type.toString(),
      }),
    );
    periodsList.push({ type: I18n.t("viesco-year"), value: undefined });

    return (
      <Dropdown
        style={{ marginRight: 5 }}
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
        {this.props.userType === "Relative" && <ChildPicker hideButton />}
        <View style={styles.dashboardPart}>
          <Text style={styles.subtitle}>{I18n.t("viesco-report-card")}</Text>
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

const styles = StyleSheet.create({
  subtitle: { color: "#AFAFAF", paddingVertical: 8 },
  dashboardPart: { paddingVertical: 8, paddingHorizontal: 15, flex: 1 },
  containerDropdowns: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 5,
  },
});
