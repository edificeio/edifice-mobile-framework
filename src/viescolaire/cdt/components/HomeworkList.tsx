import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, Switch, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { NavigationScreenProp } from "react-navigation";

import { Loading } from "../../../ui";
import { PageContainer } from "../../../ui/ContainerContent";
import { DatePicker } from "../../../ui/DatePicker";
import { EmptyScreen } from "../../../ui/EmptyScreen";
import { Text, TextBold } from "../../../ui/text";
import ChildPicker from "../../viesco/containers/ChildPicker";
import { HomeworkItem } from "./homework";
import { SessionItem } from "./session";

const style = StyleSheet.create({
  homeworkPart: { paddingBottom: 8, paddingHorizontal: 15 },
  title: { fontSize: 18 },
  subtitle: { color: "#AFAFAF" },
  course: { fontWeight: "bold", textTransform: "uppercase" },
  grid: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
});

type HomeworkListState = {
  fetching: boolean;
};

type HomeworkListProps = {
  switchValue: boolean;
  startDate: moment.Moment;
  endDate: moment.Moment;
  onStartDateChange: any;
  onEndDateChange: any;
  startHomeworksDate: moment.Moment;
  endHomeworksDate: moment.Moment;
  startSessionsDate: moment.Moment;
  endSessionsDate: moment.Moment;
  toggleSwitch: any;
  structureId: string;
  childId?: string;
  navigation: NavigationScreenProp<any>;
  fetchChildHomeworks?: any;
  fetchChildSessions?: any;
  fetchHomeworks?: any;
  fetchSessions?: any;
  updateHomeworkProgress?: any;
  homeworks: any;
  sessions: any;
  personnel: any;
  subjects: any;
};

export default class HomeworkList extends React.PureComponent<HomeworkListProps, HomeworkListState> {
  constructor(props) {
    super(props);
    const { homeworks, sessions, personnel, subjects } = props;
    this.state = {
      fetching: homeworks.isFetching || sessions.isFetching || personnel.isFetching || subjects.isFetching,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { homeworks, sessions, personnel, subjects } = this.props;
    const fetching = homeworks.isFetching || sessions.isFetching || personnel.isFetching || subjects.isFetching;
    if (fetching !== prevState.fetching) {
      this.setState({ fetching });
    }
  }

  getSubjectName = subjectId => {
    const subjectsList = this.props.subjects.data;
    const result = subjectsList.find(subject => subject.subjectId === subjectId);
    if (typeof result === "undefined") return "";
    return result.subjectLabel;
  };

  getTeacherName = teacherId => {
    const personnelList = this.props.personnel.data;
    const result = personnelList.find(personnel => personnel.id === teacherId);
    if (typeof result === "undefined") return "";
    return `${result.lastName} ${result.firstName}`;
  };

  isHomeworkDone = homework => homework.progress !== null && homework.progress.state_label === "done";

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

  onRefreshHomeworks = () => {
    const startDateString = moment(this.props.startDate).format("YYYY-MM-DD");
    const endDateString = moment(this.props.endDate).format("YYYY-MM-DD");
    if (this.props.navigation.state.params.user_type === "Relative") {
      this.props.fetchChildHomeworks(this.props.childId, this.props.structureId, startDateString, endDateString);
    } else {
      this.props.fetchHomeworks(this.props.structureId, startDateString, endDateString);
    }
  };

  onRefreshSessions = () => {
    const startDateString = moment(this.props.startDate).format("YYYY-MM-DD");
    const endDateString = moment(this.props.endDate).format("YYYY-MM-DD");
    if (this.props.navigation.state.params.user_type === "Relative") {
      this.props.fetchChildSessions(this.props.childId, startDateString, endDateString);
    } else {
      this.props.fetchSessions(this.props.structureId, startDateString, endDateString);
    }
  };

  private renderHomeworks() {
    const homeworkDataList = this.props.homeworks.data;
    const homeworksArray = Object.values(homeworkDataList);
    homeworksArray.sort((a, b) => a.due_date - b.due_date);
    return (
      <>
        {homeworksArray.length > 0 ? (
          <ScrollView
            contentContainerStyle={style.scrollView}
            refreshControl={<RefreshControl refreshing={this.state.fetching} onRefresh={this.onRefreshHomeworks} />}>
            {homeworksArray.map((homework, index, list) => (
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("HomeworkPage", this.homeworkDetailsAdapter(homework))}>
                {index === 0 ||
                moment(homework.due_date).format("DD/MM/YY") !== moment(list[index - 1].due_date).format("DD/MM/YY") ? (
                  <TextBold>
                    {I18n.t("viesco-homework-fordate")} {moment(homework.due_date).format("dddd Do MMMM")}
                  </TextBold>
                ) : null}
                {this.props.navigation.state.params.user_type === "Relative" ? (
                  <HomeworkItem
                    disabled
                    checked={this.isHomeworkDone(homework)}
                    title={this.getSubjectName(homework.subject_id)}
                    subtitle={homework.type}
                  />
                ) : (
                  <HomeworkItem
                    checked={this.isHomeworkDone(homework)}
                    title={this.getSubjectName(homework.subject_id)}
                    subtitle={homework.type}
                    onChange={() => {
                      this.props.updateHomeworkProgress(homework.id, !this.isHomeworkDone(homework));
                    }}
                  />
                )}
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

  private renderSessions() {
    const sessions = this.props.sessions.data;
    return (
      <>
        {sessions.length > 0 ? (
          <ScrollView
            contentContainerStyle={style.scrollView}
            refreshControl={<RefreshControl refreshing={this.state.fetching} onRefresh={this.onRefreshSessions} />}>
            {sessions.map((session, index, list) => (
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("SessionPage", this.sessionDetailsAdapter(session))}>
                {index === 0 ||
                moment(session.date).format("DD/MM/YY") !== moment(list[index - 1].date).format("DD/MM/YY") ? (
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
            imageSrc={require("../../../../assets/images/empty-screen/empty-homework.png")}
            imgWidth={265}
            imgHeight={280}
            title={I18n.t("viesco-session-EmptyScreenText")}
          />
        )}
      </>
    );
  }

  public render() {
    const { startDate, endDate, onStartDateChange, onEndDateChange, switchValue, toggleSwitch } = this.props;
    return (
      <PageContainer style={style.homeworkPart}>
        {this.props.navigation.state.params.user_type === "Relative" && <ChildPicker hideButton />}
        <View style={style.grid}>
          <Text>{I18n.t("viesco-from")} &ensp;</Text>
          <DatePicker date={startDate} endDate={endDate} onGetDate={onStartDateChange} />
          <Text>&emsp;{I18n.t("viesco-to")} &ensp;</Text>
          <DatePicker date={endDate} startDate={startDate} onGetDate={onEndDateChange} />
        </View>
        <View style={style.grid}>
          <Text>{I18n.t("viesco-homework")}</Text>
          <Switch
            style={{ marginTop: 30 }}
            trackColor={{ false: "#FA9700", true: "#2BAB6F" }}
            onValueChange={toggleSwitch}
            value={switchValue}
          />
          <Text>{I18n.t("viesco-session")}</Text>
        </View>
        {this.state.fetching ? <Loading /> : !switchValue ? this.renderHomeworks() : this.renderSessions()}
      </PageContainer>
    );
  }
}
