import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, Switch, ScrollView, RefreshControl, Platform } from "react-native";

import { getSessionInfo } from "../../../App";
import { INavigationProps } from "../../../types";
import { PageContainer } from "../../../ui/ContainerContent";
import DateTimePicker from "../../../ui/DateTimePicker";
import { EmptyScreen } from "../../../ui/EmptyScreen";
import { Text, TextBold } from "../../../ui/text";
import { isHomeworkDone, homeworkDetailsAdapter, sessionDetailsAdapter, getTeacherName } from "../../utils/cdt";
import ChildPicker from "../../viesco/containers/ChildPicker";
import { HomeworkItem, SessionItem } from "./Items";

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

enum SwitchState {
  HOMEWORK,
  SESSION,
}

type HomeworkListProps = {
  updateHomeworkProgress?: any;
  homeworks: any;
  sessions: any;
  personnel: any;
  isFetchingHomework: boolean;
  isFetchingSession: boolean;
  onRefreshHomeworks: any;
  onRefreshSessions: any;
  childId: string;
} & INavigationProps;

export default (props: HomeworkListProps) => {
  const [switchValue, toggleSwitch] = React.useState<SwitchState>(SwitchState.HOMEWORK);
  const [startDate, setStartDate] = React.useState<moment.Moment>(moment());
  const [endDate, setEndDate] = React.useState<moment.Moment>(moment().add(3, "week"));

  const notFirstRender = React.useRef(false);

  React.useEffect(() => {
    if (notFirstRender) {
      // avoid fetch when useState initialize
      onRefreshHomeworks();
      onRefreshSessions();
    }
  }, [startDate, endDate, props.childId]);

  React.useEffect(() => {
    notFirstRender.current = true;
  }, []);

  const onRefreshHomeworks = () => {
    props.onRefreshHomeworks(startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"));
  };

  const onRefreshSessions = () => {
    props.onRefreshSessions(startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"));
  };

  const DatePickers = React.memo(({ startDate, endDate }) => (
    <View style={style.grid}>
      <Text>{I18n.t("viesco-from")}</Text>
      <DateTimePicker
        mode="date"
        style={{ marginHorizontal: 12 }}
        value={startDate}
        maximumDate={endDate}
        onChange={setStartDate}
      />
      <Text>{I18n.t("viesco-to")}</Text>
      <DateTimePicker
        mode="date"
        style={{ marginHorizontal: 12 }}
        value={endDate}
        minimumDate={startDate}
        onChange={setEndDate}
      />
    </View>
  ));

  const PlatformSpecificSwitch = React.memo(({ value }) => {
    let newProps = {};
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

    return (
      <View style={style.grid}>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text>{I18n.t("viesco-homework")}</Text>
        </View>
        <Switch
          style={{ marginTop: 30, marginHorizontal: 12 }}
          onValueChange={() => {
            toggleSwitch(switchValue === SwitchState.SESSION ? SwitchState.HOMEWORK : SwitchState.SESSION);
          }}
          value={switchValue === SwitchState.SESSION}
          {...newProps}
        />
        <View style={{ flex: 1, alignItems: "flex-start" }}>
          <Text>{I18n.t("viesco-session")}</Text>
        </View>
      </View>
    );
  });

  const { isFetchingSession, isFetchingHomework } = props;

  return (
    <PageContainer>
      {getSessionInfo().type === "Relative" && <ChildPicker />}
      <View style={style.homeworkPart}>
        <DatePickers startDate={startDate} endDate={endDate} />
        <PlatformSpecificSwitch value={switchValue} />
        {switchValue === SwitchState.HOMEWORK ? (
          <HomeworkList
            isFetching={isFetchingHomework}
            onRefreshHomeworks={onRefreshHomeworks}
            homeworkList={props.homeworks}
            onHomeworkStatusUpdate={homework => props.updateHomeworkProgress(homework.id, !isHomeworkDone(homework))}
            onHomeworkTap={homework => props.navigation.navigate("HomeworkPage", homeworkDetailsAdapter(homework))}
          />
        ) : (
          <SessionList
            isFetching={isFetchingSession}
            onRefreshSessions={onRefreshSessions}
            sessionList={props.sessions}
            onSessionTap={session =>
              props.navigation.navigate("SessionPage", sessionDetailsAdapter(session, props.personnel))
            }
            personnelList={props.personnel}
          />
        )}
      </View>
    </PageContainer>
  );
};

const EmptyComponent = ({ title }) => (
  <EmptyScreen
    imageSrc={require("../../../../assets/images/empty-screen/empty-homework.png")}
    imgWidth={265}
    imgHeight={280}
    title={title}
  />
);

const HomeworkList = ({
  isFetching,
  onRefreshHomeworks,
  homeworkList,
  onHomeworkTap,
  onHomeworkStatusUpdate,
}) => {
  React.useEffect(() => {
    if (Object.keys(homeworkList).length === 0) onRefreshHomeworks();
  }, []);

  const homeworkDataList = homeworkList;
  const homeworksArray = Object.values(homeworkDataList);
  homeworksArray.sort((a, b) => a.due_date - b.due_date);
  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefreshHomeworks} />}>
      {homeworksArray.length === 0 ? (
        <EmptyComponent title={I18n.t("viesco-homework-EmptyScreenText")} />
      ) : (
        homeworksArray.map((homework, index, list) => (
          <View key={homework.id}>
            {index === 0 ||
            moment(homework.due_date).format("DD/MM/YY") !== moment(list[index - 1].due_date).format("DD/MM/YY") ? (
              <TextBold>
                {I18n.t("viesco-homework-fordate")} {moment(homework.due_date).format("dddd Do MMMM")}
              </TextBold>
            ) : null}
            <HomeworkItem
              onPress={() => onHomeworkTap(homework)}
              disabled={getSessionInfo().type !== "Student"}
              checked={isHomeworkDone(homework)}
              title={homework.subject.name}
              subtitle={homework.type}
              onChange={() => onHomeworkStatusUpdate(homework)}
            />
          </View>
        ))
      )}
    </ScrollView>
  );
};

const SessionList = ({ isFetching, onRefreshSessions, sessionList, onSessionTap, personnelList }) => {
  React.useEffect(() => {
    if (sessionList.length === 0) onRefreshSessions();
  }, []);

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefreshSessions} />}>
      {sessionList.length === 0 ? (
        <EmptyComponent title={I18n.t("viesco-session-EmptyScreenText")} />
      ) : (
        sessionList.map((session, index, list) => (
          <View>
            {index === 0 ||
            moment(session.date).format("DD/MM/YY") !== moment(list[index - 1].date).format("DD/MM/YY") ? (
              <TextBold>{moment(session.date).format("DD/MM/YY")}</TextBold>
            ) : null}
            <SessionItem
              onPress={() => onSessionTap(session)}
              matiere={session.subject.name}
              author={getTeacherName(session.teacher_id, personnelList)}
            />
          </View>
        ))
      )}
    </ScrollView>
  );
};
