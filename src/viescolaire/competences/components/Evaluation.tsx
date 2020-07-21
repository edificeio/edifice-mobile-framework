import I18n from "i18n-js";
import * as React from "react";
import { View, StyleSheet } from "react-native";

import { PageContainer } from "../../../ui/ContainerContent";
import Dropdown from "../../../ui/Dropdown";
import { EmptyScreen } from "../../../ui/EmptyScreen";
import { Text, TextBold } from "../../../ui/text";
import ChildPicker from "../../viesco/containers/ChildPicker";
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
    };
  }

  componentDidMount() {
    this.props.getDevoirs();
  }

  componentDidUpdate(prevProps, prevState) {
    const { devoirsList, devoirsMoyennesList } = this.props;
    const fetching = devoirsList.isFetching || devoirsMoyennesList;
    if (prevProps.devoirsList !== this.state.devoirs && this.state.screenDisplay !== "period") {
      this.setState(
        {
          devoirs: devoirsList.data,
          fetching,
        },
        () => {
          this.renderDevoirsList();
        }
      );
    } else if (prevProps.devoirsMoyennesList !== this.state.devoirs && this.state.screenDisplay === "period") {
      this.setState(
        {
          devoirs: devoirsMoyennesList.data,
          fetching,
        },
        () => {
          this.renderDevoirsByPeriod();
        }
      );
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

  private renderDevoirsByPeriod() {
    return (
      <View style={{ height: "78%" }}>
        {this.state.devoirs !== undefined &&
        this.state.devoirs.length > 0 &&
        this.props.devoirsMoyennesList.data === this.state.devoirs ? (
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row" }}>
              <TextBold style={{ marginBottom: 10 }}>{this.state.selectedPeriod.toUpperCase()}</TextBold>
              <Text>- {I18n.t("viesco-average").toUpperCase()}</Text>
            </View>
            {console.log("devoirsP: ", this.state.devoirs)}
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
            <Text style={{ color: "#AFAFAF" }}>{this.state.selectedPeriod.toUpperCase()}</Text>
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
        this.props.getDevoirs(subjectId, this.state.selectedPeriod);
      } else {
        this.props.getDevoirs(subjectId);
      }
    }
    this.setState({ selectedDiscipline: discipline, disciplineId: subjectId }, this.screenRenderOpt);
  }

  private initDevoirsByPeriods(period) {
    if (this.state.disciplineId === "") {
      this.props.getDevoirsMoyennes(period);
    } else {
      this.props.getDevoirs(this.state.disciplineId, period);
    }
    this.setState({ selectedPeriod: period }, this.screenRenderOpt);
  }

  private displayDisciplinesDropdown() {
    let disciplines = this.state.subjectsList.map(({ subjectLabel }) => subjectLabel);
    disciplines.unshift("Disciplines");

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
    const periods = ["Période", "Trimestre 1", "Trimestre 2", "Trimestre 3", "Année"];

    return (
      <Dropdown
        data={Object.values(periods)}
        value={this.state.selectedPeriod}
        onSelect={(period: string) => this.initDevoirsByPeriods(period)}
        renderItem={(item: string) => item}
      />
    );
  }

  public render() {
    return (
      <PageContainer>
        {this.props.userType === "Relative" ? <ChildPicker hideButton /> : null}
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
