import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, Switch } from "react-native";

import { Loading } from "../../../ui";
import { PageContainer } from "../../../ui/ContainerContent";
import Dropdown from "../../../ui/Dropdown";
import { EmptyScreen } from "../../../ui/EmptyScreen";
import { Text, TextBold } from "../../../ui/text";
import ChildPicker from "../../viesco/containers/ChildPicker";
import { IPeriodsList } from "../../viesco/state/periods";
import { ISubjectList, ISubjectListState } from "../../viesco/state/subjects";
import { IDevoirListState } from "../state/devoirs";
import { IMoyenneListState } from "../state/moyennes";
import { GradesDevoirs, GradesDevoirsMoyennes } from "./Item";

// eslint-disable-next-line flowtype/no-types-missing-file-annotation
export type ICompetencesProps = {
  devoirsList: IDevoirListState;
  devoirsMoyennesList: IMoyenneListState;
  subjects: ISubjectListState;
  userType: string;
  periods: IPeriodsList;
  groupId: string;
  structureId: string;
  childId: string;
  getDevoirs: (structureId: string, studentId: string, period?: string, matiere?: string) => void;
  getDevoirsMoyennes: (structureId: string, studentId: string, period?: string) => void;
  getPeriods: (structureId: string, groupId: string) => void;
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
  subjectsList: ISubjectList;
  screenDisplay: ScreenDisplay;
  switchValue: SwitchState;
  selectedDiscipline: string;
  selectedPeriod: ISelectedPeriod;
  disciplineId: string;
};

export default class Competences extends React.PureComponent<ICompetencesProps, ICompetencesState> {
  constructor(props) {
    super(props);

    const { devoirsList } = this.props;
    this.state = {
      devoirs: devoirsList.data.sort((a, b) => moment(b.date, "DD/MM/YYYY").diff(moment(a.date, "DD/MM/YYYY"))),
      subjectsList: this.props.subjects.data,
      screenDisplay: ScreenDisplay.DASHBOARD,
      switchValue: SwitchState.DEFAULT,
      selectedDiscipline: I18n.t("viesco-competences-disciplines"),
      selectedPeriod: { type: I18n.t("viesco-competences-period"), value: undefined },
      disciplineId: "",
    };
  }

  componentDidMount() {
    const { structureId, childId, groupId } = this.props;
    this.props.getDevoirs(structureId, childId);
    this.props.getPeriods(structureId, groupId);
  }

  // Update when changing child with relative account
  componentWillUpdate(nextProps) {
    const { structureId, childId, groupId } = this.props;
    const { selectedPeriod } = this.state;

    if (this.props.childId !== nextProps.childId && this.state.screenDisplay === ScreenDisplay.PERIOD) {
      this.props.getDevoirsMoyennes(structureId, childId, selectedPeriod.value!);
      this.props.getPeriods(structureId, groupId);
    } else if (this.props.childId !== nextProps.childId) {
      this.props.getDevoirs(structureId, childId, selectedPeriod.value, this.state.disciplineId!);
      this.props.getPeriods(structureId, groupId);
    }
  }

  // Update devoirsList after new fetch
  componentDidUpdate(prevProps) {
    const { devoirsList, devoirsMoyennesList } = this.props;
    const { devoirs, screenDisplay } = this.state;

    if (prevProps.devoirsList !== devoirs && screenDisplay !== ScreenDisplay.PERIOD && !devoirsList.isFetching) {
      const list = devoirsList.data.sort((a, b) => moment(b.date, "DD/MM/YYYY").diff(moment(a.date, "DD/MM/YYYY")));
      this.setState({ devoirs: list });
    } else if (
      prevProps.devoirsMoyennesList !== devoirs &&
      screenDisplay === ScreenDisplay.PERIOD &&
      !devoirsMoyennesList.isFetching
    ) {
      this.setState({ devoirs: devoirsMoyennesList.data });
    }
  }

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
      <View style={{ height: "78%" }}>
        <View style={{ flexDirection: "row" }}>
          <TextBold style={{ marginBottom: 10, paddingTop: 3 }}>{selectedPeriod.type}</TextBold>
          <Text style={{ paddingTop: 3 }}> - {I18n.t("viesco-average").toUpperCase()}</Text>
        </View>
        {devoirsMoyennesList.isFetching ? (
          <Loading />
        ) : devoirs !== undefined && devoirs.length > 0 ? (
          <GradesDevoirsMoyennes devoirs={devoirs} />
        ) : (
          <EmptyScreen
            imageSrc={require("../../../../assets/images/empty-screen/empty-evaluations.png")}
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
    return (
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {screenDisplay === ScreenDisplay.DASHBOARD ? (
          <TextBold style={{ marginBottom: 10, paddingTop: 3 }}>{I18n.t("viesco-last-grades")}</TextBold>
        ) : (
          <View style={{ flexDirection: "row" }}>
            <TextBold style={{ marginBottom: 10, paddingTop: 3 }}>{selectedDiscipline}&ensp;</TextBold>
            <Text style={{ color: "#AFAFAF", paddingTop: 3 }}>{selectedPeriod.type}</Text>
          </View>
        )}
        <View style={{ marginBottom: 10, flexDirection: "row" }}>
          <Text style={{ paddingTop: 3 }}>{I18n.t("viesco-colors")}</Text>
          <Switch
            onValueChange={() => {
              this.setState({
                switchValue: switchValue === SwitchState.DEFAULT ? SwitchState.COLOR : SwitchState.DEFAULT,
              });
            }}
            value={switchValue === SwitchState.COLOR}
          />
        </View>
      </View>
    );
  };

  private renderDevoirsList() {
    const { devoirsList } = this.props;
    const { devoirs, switchValue } = this.state;
    return (
      <View style={{ height: "78%" }}>
        {this.renderHeaderDevoirsList()}
        {devoirsList.isFetching ? (
          <Loading />
        ) : devoirs !== undefined && devoirs.length > 0 && devoirs === devoirsList.data ? (
          <GradesDevoirs devoirs={devoirs} color={switchValue !== SwitchState.DEFAULT} />
        ) : (
          <EmptyScreen
            imageSrc={require("../../../../assets/images/empty-screen/empty-evaluations.png")}
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
    const { subjectsList, selectedPeriod } = this.state;

    let subjectId = "";
    if (discipline !== I18n.t("viesco-competences-disciplines")) {
      subjectId = subjectsList.find(item => item.subjectLabel === discipline)!.subjectId;
      this.props.getDevoirs(structureId, childId, selectedPeriod.value!, subjectId);
    } else this.props.getDevoirs(structureId, childId);

    if (selectedPeriod.type === I18n.t("viesco-competences-period"))
      this.setState({ selectedPeriod: { type: I18n.t("viesco-year"), value: undefined } });
    this.setState({ selectedDiscipline: discipline, disciplineId: subjectId }, this.screenRenderOpt);
  }

  private initDevoirsByPeriods(period: ISelectedPeriod) {
    const { structureId, childId } = this.props;
    const { disciplineId } = this.state;

    if (disciplineId === "") {
      this.props.getDevoirsMoyennes(structureId, childId, period.value!);
    } else {
      this.props.getDevoirs(structureId, childId, period.value!, disciplineId);
    }
    this.setState({ selectedPeriod: period }, this.screenRenderOpt);
  }

  private displayDisciplinesDropdown() {
    let disciplines = this.state.subjectsList.map(({ subjectLabel }) => subjectLabel);
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
    this.props.periods.map(({ order, type }) =>
      periodsList.push({
        type: `${I18n.t("viesco-competences-period-" + type) + " " + order}`,
        value: order.toString(),
      })
    );
    periodsList.push({ type: I18n.t("viesco-year"), value: undefined });

    return (
      <Dropdown
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
    marginTop: 10,
    paddingBottom: 10,
    marginHorizontal: 10,
  },
});
