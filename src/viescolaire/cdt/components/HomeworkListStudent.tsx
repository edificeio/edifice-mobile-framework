import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, Switch, TouchableOpacity, ScrollView } from "react-native";

import { Loading } from "../../../ui";
import { PageContainer } from "../../../ui/ContainerContent";
import { DatePicker } from "../../../ui/DatePicker";
import { EmptyScreen } from "../../../ui/EmptyScreen";
import { Text, TextBold } from "../../../ui/text";
import { HomeworkItem } from "./homework";
import { SessionItem } from "./session";

const style = StyleSheet.create({
  homeworkPart: { paddingVertical: 8, paddingHorizontal: 15 },
  title: { fontSize: 18 },
  subtitle: { color: "#AFAFAF" },
  course: { fontWeight: "bold", textTransform: "uppercase" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default class HomeworkList extends React.PureComponent<any, any> {
  constructor(props) {
    super(props);
    const { homeworks, sessions, personnel, subjects } = props;
    this.state = {
      homeworkDataList: homeworks.data,
      sessionDataList: sessions.data,
      personnelList: personnel.data,
      subjectsList: subjects.data,
      switchValue: false,
      startDate: moment(),
      endDate: moment(),
      startHomeworksDate: moment(),
      endHomeworksDate: moment(),
      startSessionsDate: moment(),
      endSessionsDate: moment(),
      fetching: homeworks.isFetching || sessions.isFetching || personnel.isFetching || subjects.isFetching,
      structureId: "97a7363c-c000-429e-9c8c-d987b2a2c204",
    };
  }

  async componentDidMount() {
    const { structureId, startDate, endDate } = this.state;
    const startDateString = moment(startDate).format("YYYY-MM-DD");
    const endDateString = moment(endDate).format("YYYY-MM-DD");
    this.props.fetchHomeworks(structureId, startDateString, endDateString);
    this.props.fetchSessions(structureId, startDateString, endDateString);
    this.props.fetchSubjects(structureId);
    this.props.fetchPersonnel(structureId);
  }

  componentDidUpdate() {
    const { homeworks, sessions, personnel, subjects } = this.props;
    const fetching = homeworks.isFetching || sessions.isFetching || personnel.isFetching || subjects.isFetching;
    this.setState({
      homeworkDataList: homeworks.data,
      sessionDataList: sessions.data,
      personnelList: personnel.data,
      subjectsList: subjects.data,
      fetching,
    });
  }

  updateHomeworks = () => {
    const { structureId, startHomeworksDate, endHomeworksDate } = this.state;
    const startDateString = moment(startHomeworksDate).format("YYYY-MM-DD");
    const endDateString = moment(endHomeworksDate).format("YYYY-MM-DD");
    this.props.fetchHomeworks(structureId, startDateString, endDateString);
  };

  updateSessions = async () => {
    const { structureId, startSessionsDate, endSessionsDate } = this.state;
    const startDateString = moment(startSessionsDate).format("YYYY-MM-DD");
    const endDateString = moment(endSessionsDate).format("YYYY-MM-DD");
    this.props.fetchSessions(structureId, startDateString, endDateString);
  };

  onStartDateChange = startDate => {
    if (this.state.switchValue) {
      this.setState({ startDate, startSessionsDate: startDate });
      this.updateSessions();
    } else {
      this.setState({ startDate, startHomeworksDate: startDate });
      this.updateHomeworks();
    }
  };

  onEndDateChange = endDate => {
    if (this.state.switchValue) {
      this.setState({ endDate, endSessionsDate: endDate });
      this.updateSessions();
    } else {
      this.setState({ endDate, endHomeworksDate: endDate });
      this.updateHomeworks();
    }
  };

  private toggleSwitch = value => {
    this.setState({ switchValue: value });
    const { startDate, endDate, startHomeworksDate, endHomeworksDate, startSessionsDate, endSessionsDate } = this.state;
    // fetching homeworks/sessions on switch only if last fetch was with different dates
    if (value) {
      if (
        moment(startDate).format("YYMMDD") !== moment(startSessionsDate).format("YYMMDD") ||
        moment(endDate).format("YYMMDD") !== moment(endSessionsDate).format("YYMMDD")
      ) {
        this.setState({ startSessionsDate: startDate, endSessionsDate: endDate }, () => {
          this.updateSessions();
        });
      }
    } else {
      if (
        moment(startDate).format("YYMMDD") !== moment(startHomeworksDate).format("YYMMDD") ||
        moment(endDate).format("YYMMDD") !== moment(endHomeworksDate).format("YYMMDD")
      ) {
        this.setState({ startHomeworksDate: startDate, endHomeworksDate: endDate }, () => {
          this.updateHomeworks();
        });
      }
    }
  };

  getSubjectName = subjectId => {
    const { subjectsList } = this.state;
    const result = subjectsList.find(subject => subject.subjectId === subjectId);
    if (typeof result === "undefined") return "";
    return result.subjectLabel;
  };

  getTeacherName = teacherId => {
    const { personnelList } = this.state;
    const result = personnelList.find(personnel => personnel.id === teacherId);
    if (typeof result === "undefined") return "";
    return `${result.lastName} ${result.firstName}`;
  };

  isHomeworkDone = homework => {
    if (homework.progress === null) return false;
    return homework.progress.state_label === "done";
  };

  homeworkDetailsAdapter = homework => {
    return {
      subject: this.getSubjectName(homework.subject_id),
      description: homework.description,
      due_date: homework.due_date,
      type: homework.type,
      created_date: homework.created_date,
    };
  };

  sessionDetailsAdapter = session => {
    return {
      subject: this.getSubjectName(session.subject_id),
      date: session.date,
      teacher: this.getTeacherName(session.teacher_id),
      description: session.description,
      title: session.title,
    };
  };

  private homeworkToDo() {
    const homeworkDataList = this.props.homeworks.data;
    const homeworksArray = Object.values(homeworkDataList);
    homeworksArray.sort((a, b) => a.due_date - b.due_date);
    return (
      <>
        {this.state.homeworkDataList != undefined && homeworksArray.length > 0 ? (
          <ScrollView>
            {homeworksArray.map((homework, index, list) => (
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("HomeworkPage", this.homeworkDetailsAdapter(homework))}>
                {index === 0 ||
                moment(homework.due_date).format("DD/MM/YY") != moment(list[index - 1].due_date).format("DD/MM/YY") ? (
                  <TextBold>
                    {I18n.t("viesco-homework-fordate")} {moment(homework.due_date).format("dddd Do MMMM")}
                  </TextBold>
                ) : null}
                <HomeworkItem
                  checked={this.isHomeworkDone(homework)}
                  title={this.getSubjectName(homework.subject_id)}
                  subtitle={homework.type}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <EmptyScreen
            imageSrc={require("../../../../assets/images/empty-screen/empty-homework.png")}
            imgWidth={265}
            imgHeight={280}
            title={I18n.t("viesco-homework-EmptyScreenText")}
          />
        )}
      </>
    );
  }

  private sessionToDo() {
    return (
      <>
        {this.state.sessionDataList != undefined && this.state.sessionDataList.length > 0 ? (
          <ScrollView>
            {this.state.sessionDataList.map((session, index, list) => (
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("SessionPage", this.sessionDetailsAdapter(session))}>
                {index === 0 ||
                moment(session.date).format("DD/MM/YY") != moment(list[index - 1].date).format("DD/MM/YY") ? (
                  <TextBold>{moment(session.date).format("DD/MM/YY")}</TextBold>
                ) : null}
                <SessionItem
                  matiere={this.getSubjectName(session.subject_id)}
                  author={this.getTeacherName(session.teacher_id)}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <EmptyScreen
            imageSrc={require("../../../../assets/images/empty-screen/empty-evaluations.png")}
            imgWidth={265}
            imgHeight={280}
            title={I18n.t("viesco-session-EmptyScreenText")}
          />
        )}
      </>
    );
  }

  public render() {
    return (
      <PageContainer style={style.homeworkPart}>
        <View style={style.grid}>
          <Text>{I18n.t("viesco-from")} &ensp;</Text>
          <DatePicker onGetDate={this.onStartDateChange} />
          <Text>&emsp;{I18n.t("viesco-to")} &ensp;</Text>
          <DatePicker onGetDate={this.onEndDateChange} />
        </View>
        <View style={style.grid}>
          <Text>{I18n.t("viesco-homework")}</Text>
          <Switch
            style={{ marginTop: 30 }}
            trackColor={{ false: "#FA9700", true: "#2BAB6F" }}
            onValueChange={this.toggleSwitch}
            value={this.state.switchValue}
          />
          <Text>{I18n.t("viesco-session")}</Text>
        </View>
        {this.state.fetching ? <Loading /> : !this.state.switchValue ? this.homeworkToDo() : this.sessionToDo()}
      </PageContainer>
    );
  }
}
