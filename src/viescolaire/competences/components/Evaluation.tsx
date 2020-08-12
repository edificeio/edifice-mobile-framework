import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet } from "react-native";

import { PageContainer } from "../../../ui/ContainerContent";
import Dropdown from "../../../ui/Dropdown";
import { EmptyScreen } from "../../../ui/EmptyScreen";
import { Text, TextBold } from "../../../ui/text";
import ChildPicker from "../../viesco/containers/ChildPicker";
import { IPeriod } from "../../viesco/state/periods";
import { GradesDevoirs, GradesDevoirsMoyennes } from "./Item";

export default class Competences extends React.PureComponent<any, any> {
  constructor(props) {
    super(props);

    const { devoirsList, devoirsMoyennesList } = this.props;
    this.state = {
      devoirs: devoirsList.data,
      fetching: devoirsList.isFetching || devoirsMoyennesList.isFetching,
      subjectsList: this.props.subjects.data,
      screenDisplay: "dashboard",
      selectedDiscipline: "Disciplines",
      selectedPeriod: "Période",
      disciplineId: "",
      startDate: moment(),
      endDate: moment(),
    };
  }

  componentDidMount() {
    this.props.getDevoirs();
    this.props.getPeriods(this.props.structureId, this.props.groupId);
    this.props.getYear();
  }

  componentDidUpdate(prevProps, prevState) {
    const { devoirsList, devoirsMoyennesList } = this.props;
    const fetching = devoirsList.isFetching || devoirsMoyennesList;
    if (prevProps.devoirsList !== this.state.devoirs && this.state.screenDisplay !== "period") {
      this.setState({
        devoirs: devoirsList.data,
        fetching,
      });
    } else if (prevProps.devoirsMoyennesList !== this.state.devoirs && this.state.screenDisplay === "period") {
      this.setState({
        devoirs: devoirsMoyennesList.data,
        fetching,
      });
    }
  }

  screenRenderOpt = () => {
    if (this.state.selectedPeriod !== "Période" && this.state.selectedDiscipline === "Disciplines") {
      this.setState({ screenDisplay: "period" });
    } else if (this.state.selectedDiscipline !== "Disciplines") {
      this.setState({ screenDisplay: "discipline" });
    } else {
      this.setState({ screenDisplay: "dashboard" });
    }
  };

  renderOption = item => {
    if (item === parseInt(item, 10)) {
      return I18n.t("viesco-trimester") + " " + item;
    } else if (item === "Période") {
      return "Période";
    } else {
      return I18n.t("viesco-year");
    }
  };

  private renderDevoirsByPeriod() {
    return (
      <View style={{ height: "78%" }}>
        {this.state.devoirs !== undefined &&
        this.state.devoirs.length > 0 &&
        this.props.devoirsMoyennesList.data === this.state.devoirs ? (
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row" }}>
              <TextBold style={{ marginBottom: 10 }}>{this.renderOption(this.state.selectedPeriod)}</TextBold>
              <Text>- {I18n.t("viesco-average").toUpperCase()}</Text>
            </View>
            <GradesDevoirsMoyennes devoirs={this.state.devoirs} />
          </View>
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

  private renderDevoirsList() {
    return (
      <View style={{ height: "78%" }}>
        {this.state.screenDisplay === "dashboard" && this.props.devoirsList.data === this.state.devoirs ? (
          <TextBold style={{ marginBottom: 10 }}>{I18n.t("viesco-last-grades")}</TextBold>
        ) : (
          <View style={{ flexDirection: "row" }}>
            <TextBold style={{ marginBottom: 10 }}>{this.state.selectedDiscipline}&ensp;</TextBold>
            <Text style={{ color: "#AFAFAF" }}>{this.renderOption(this.state.selectedPeriod)}</Text>
          </View>
        )}
        {this.state.devoirs !== undefined && this.state.devoirs.length > 0 ? (
          <GradesDevoirs devoirs={this.state.devoirs} />
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
    let subjectId = "";
    if (discipline !== "Disciplines") {
      subjectId = this.state.subjectsList.find(item => item.subjectLabel === discipline).subjectId;

      if (this.state.selectedPeriod !== "Période") {
        this.props.getDevoirs(subjectId, this.state.startDate, this.state.endDate);
      } else {
        this.props.getDevoirs(subjectId);
      }
    }
    this.setState({ selectedDiscipline: discipline, disciplineId: subjectId }, this.screenRenderOpt);
  }

  private initPeriodsDates(period) {
    const { periods, year } = this.props;
    if (period === "Période") {
      this.setState({ startDate: moment() });
      this.setState({ endDate: moment() });
    } else if (period === year.data) {
      this.setState({ startDate: period.start_date });
      this.setState({ endDate: period.end_date });
    } else {
      const trimester = periods.data.find(order => period);
      this.setState({ startDate: trimester.start_date });
      this.setState({ endDate: trimester.end_date });
    }
  }

  private initDevoirsByPeriods(period) {
    this.initPeriodsDates(period);
    if (this.state.disciplineId === "") {
      this.props.getDevoirsMoyennes(this.state.startDate, this.state.endDate);
    } else {
      this.props.getDevoirs(this.state.disciplineId, this.state.startDate, this.state.endDate);
    }
    this.setState({ selectedPeriod: period }, this.screenRenderOpt);
  }

  private displayDisciplinesDropdown() {
    let disciplines = this.state.subjectsList.map(({ subjectLabel }) => subjectLabel);
    disciplines.unshift("Disciplines");

    return (
      // TODO adapt to new Dropdown
      // <Dropdown
      //   data={Object.values(disciplines)}
      //   value={this.state.selectedDiscipline}
      //   onSelect={(discipline: string) => this.initDevoirsByDisciplines(discipline)}
      //   renderItem={(item: string) => item}
      // />
      <View />
    );
  }

  private displayPeriodsDropdown() {
    const { periods, year } = this.props;
    let periodsList = ["Période"];
    periods.data.map(({ order }) => periodsList.push(order));
    periodsList.push(year.data);

    return (
      // TODO adapt to new Dropdown
      // <Dropdown
      //   data={Object.values(periodsList)}
      //   value={this.state.selectedPeriod}
      //   onSelect={(period: string) => this.initDevoirsByPeriods(period)}
      //   renderItem={(item: IPeriod) => this.renderOption(item)}
      // />
      <View />
    );
  }

  public render() {
    return (
      <PageContainer>
        {this.props.userType === "Relative" && <ChildPicker hideButton />}
        <View style={styles.dashboardPart}>
          <Text style={styles.subtitle}>{I18n.t("viesco-report-card")}</Text>
          <View style={styles.containerDropdowns}>
            {this.displayDisciplinesDropdown()}
            {this.displayPeriodsDropdown()}
          </View>
          {this.state.screenDisplay === "period" ? this.renderDevoirsByPeriod() : this.renderDevoirsList()}
        </View>
      </PageContainer>
    );
  }
}

const styles = StyleSheet.create({
  subtitle: { color: "#AFAFAF", paddingVertical: 8 },
  dashboardPart: { paddingVertical: 8, paddingHorizontal: 15 },
  containerDropdowns: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 10,
    paddingBottom: 10,
    marginHorizontal: 10,
  },
});
