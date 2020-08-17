import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, Switch, TouchableOpacity, ScrollView, RefreshControl, Platform } from "react-native";
import { NavigationScreenProp } from "react-navigation";

import { Loading } from "../../../ui";
import { PageContainer } from "../../../ui/ContainerContent";
import DateTimePicker from "../../../ui/DateTimePicker";
import { EmptyScreen } from "../../../ui/EmptyScreen";
import { Text, TextBold } from "../../../ui/text";
import ChildPicker from "../../viesco/containers/ChildPicker";
import { HomeworkItem, SessionItem } from "./Items";
import {
  isHomeworkDone,
  getSubjectName,
  homeworkDetailsAdapter,
  sessionDetailsAdapter,
  getTeacherName,
} from "../../utils/cdt";

const style = StyleSheet.create({
  homeworkPart: { flex: 1, paddingBottom: 8, paddingHorizontal: 15 },
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
});

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
  isFetching: boolean;
};

export default class HomeworkList extends React.PureComponent<HomeworkListProps, {}> {
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
    const homeworkDataList = this.props.homeworks;
    const homeworksArray = Object.values(homeworkDataList);
    homeworksArray.sort((a, b) => a.due_date - b.due_date);
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={this.props.isFetching} onRefresh={this.onRefreshHomeworks} />}>
        {homeworksArray.map((homework, index, list) => (
          <View>
            {index === 0 ||
            moment(homework.due_date).format("DD/MM/YY") !== moment(list[index - 1].due_date).format("DD/MM/YY") ? (
              <TextBold>
                {I18n.t("viesco-homework-fordate")} {moment(homework.due_date).format("dddd Do MMMM")}
              </TextBold>
            ) : null}
            <HomeworkItem
              onPress={() =>
                this.props.navigation.navigate("HomeworkPage", homeworkDetailsAdapter(homework, this.props.subjects))
              }
              disabled={this.props.navigation.state.params.user_type === "Relative"}
              checked={isHomeworkDone(homework)}
              title={getSubjectName(homework.subject_id, this.props.subjects)}
              subtitle={homework.type}
              onChange={() => {
                this.props.navigation.state.params.user_type !== "Relative" &&
                  this.props.updateHomeworkProgress(homework.id, !isHomeworkDone(homework));
              }}
            />
          </View>
        ))}
      </ScrollView>
    );
  }

  private renderSessions() {
    const sessions = this.props.sessions;
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={this.props.isFetching} onRefresh={this.onRefreshSessions} />}>
        {sessions.map((session, index, list) => (
          <View>
            {index === 0 ||
            moment(session.date).format("DD/MM/YY") !== moment(list[index - 1].date).format("DD/MM/YY") ? (
              <TextBold>{moment(session.date).format("DD/MM/YY")}</TextBold>
            ) : null}
            <SessionItem
              onPress={() =>
                this.props.navigation.navigate(
                  "SessionPage",
                  sessionDetailsAdapter(session, this.props.subjects, this.props.personnel)
                )
              }
              matiere={getSubjectName(session.subject_id, this.props.subjects)}
              author={getTeacherName(session.teacher_id, this.props.personnel)}
            />
          </View>
        ))}
      </ScrollView>
    );
  }

  private PlatformSpecificSwitch(props) {
    const { value } = props;
    let newProps = { ...props };
    switch (Platform.OS) {
      case "android": {
        newProps = { thumbColor: value ? "#2BAB6F" : "#FA9700", ...newProps };
        break;
      }
      case "ios": {
        newProps = {
          trackColor: { false: "#FA9700", true: "#2BAB6F" },
          ios_backgroundColor: "#FA9700",
          ...newProps,
        };
        break;
      }
      default: {
        newProps = { trackColor: { false: "#FA9700", true: "#2BAB6F" }, ...newProps };
        break;
      }
    }
    return <Switch {...newProps} />;
  }

  private renderMainList = () => {
    if (this.props.isFetching) {
      return <Loading />;
    } else if (this.props.homeworks.length == 0 && this.props.sessions.length == 0) {
      return (
        <EmptyScreen
          imageSrc={require("../../../../assets/images/empty-screen/empty-homework.png")}
          imgWidth={265}
          imgHeight={280}
          title={I18n.t(this.props.switchValue ? "viesco-session-EmptyScreenText" : "viesco-homework-EmptyScreenText")}
        />
      );
    } else {
      return this.props.switchValue ? this.renderSessions() : this.renderHomeworks();
    }
  };

  public render() {
    const { startDate, endDate, onStartDateChange, onEndDateChange, switchValue, toggleSwitch } = this.props;
    return (
      <PageContainer>
        {this.props.navigation.state.params.user_type === "Relative" && <ChildPicker />}
        <View style={style.homeworkPart}>
          <View style={style.grid}>
            <Text>{I18n.t("viesco-from")}</Text>
            <DateTimePicker
              mode="date"
              style={{ marginHorizontal: 12 }}
              value={startDate}
              maximumDate={endDate}
              onChange={onStartDateChange}
            />
            <Text>{I18n.t("viesco-to")}</Text>
            <DateTimePicker
              mode="date"
              style={{ marginHorizontal: 12 }}
              value={endDate}
              minimumDate={startDate}
              onChange={onEndDateChange}
            />
          </View>
          <View style={style.grid}>
            <Text>{I18n.t("viesco-homework")}</Text>
            <this.PlatformSpecificSwitch
              style={{ marginTop: 30, marginHorizontal: 12 }}
              onValueChange={toggleSwitch}
              value={switchValue}
            />
            <Text>{I18n.t("viesco-session")}</Text>
          </View>
          {this.renderMainList()}
        </View>
      </PageContainer>
    );
  }
}
