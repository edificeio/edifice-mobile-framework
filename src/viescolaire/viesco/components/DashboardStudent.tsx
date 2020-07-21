import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { NavigationActions } from "react-navigation";

import { Icon } from "../../../ui";
import { TextBold } from "../../../ui/text";
import { HomeworkItem } from "../../cdt/components/homework";

const style = StyleSheet.create({
  dashboardPart: { paddingVertical: 8, paddingHorizontal: 15 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridButtonContainer: {
    width: "50%",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  gridButton: {
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  gridButtonText: {
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  title: { fontSize: 18 },
  subtitle: { color: "#AFAFAF" },
  homeworks: {},
  evaluations: {},
});

type DashboardProps = {
  homeworks?: any[];
};

const IconButton = ({ icon, color, text, onPress }) => {
  return (
    <View style={style.gridButtonContainer}>
      <TouchableOpacity onPress={onPress} style={[style.gridButton, { backgroundColor: color }]}>
        <Icon size={20} color="white" name={icon} />
        <Text style={style.gridButtonText}>{text}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default class Dashboard extends React.PureComponent<any & dashboardProps> {
  private renderNavigationGrid() {
    return (
      <View style={[style.dashboardPart, style.grid]}>
        <IconButton
          onPress={() =>
            this.props.navigation.navigate(
              "presences",
              {},
              NavigationActions.navigate({
                routeName: "History",
                params: {
                  user_type: "Student",
                },
              })
            )
          }
          text={I18n.t("viesco-history")}
          color="#FCB602"
          icon="access_time"
        />
        <IconButton onPress={() => true} text={I18n.t("viesco-timetable")} color="#162EAE" icon="reservation" />
        <IconButton
          onPress={() => this.props.navigation.navigate("HomeworkList", { user_type: "Student" })}
          text={I18n.t("Homework")}
          color="#2BAB6F"
          icon="check-1"
        />
        <IconButton onPress={() => true} text={I18n.t("viesco-tests")} color="#F95303" icon="stats-bars2" />
      </View>
    );
  }

  getSubjectName = subjectId => {
    const subjectsList = this.props.subjects.data;
    const result = subjectsList.find(subject => subject.subjectId === subjectId);
    if (typeof result === "undefined") return "";
    return result.subjectLabel;
  };

  isHomeworkDone = homework => {
    if (homework.progress === null) return false;
    return homework.progress.state_label === "done";
  };

  private renderHomework(homeworks) {
    let homeworksByDate = {};
    Object.values(homeworks).forEach(hm => {
      const key = moment(hm.due_date).format("YYYY-MM-DD");
      if (typeof homeworksByDate[key] === "undefined") homeworksByDate[key] = [];
      homeworksByDate[key].push(hm);
    });

    const tomorrowDate = moment().add(1, "day");

    homeworksByDate = Object.keys(homeworksByDate)
      .sort()
      .slice(0, 5)
      .reduce(function(memo, current) {
        memo[current] = homeworksByDate[current];
        return memo;
      }, {});

    return (
      <View style={style.dashboardPart}>
        <TextBold style={style.title}>{I18n.t("viesco-homework")}</TextBold>
        {Object.keys(homeworksByDate).map(date => (
          <>
            {moment(date).isAfter(moment()) && (
              <>
                <Text style={style.subtitle}>
                  {moment(date).isSame(tomorrowDate, "day")
                    ? I18n.t("viesco-homework-fortomorrow")
                    : `${I18n.t("viesco-homework-fordate")} ${moment(date).format("DD/MM/YYYY")}`}
                </Text>
                {homeworksByDate[date].map(homework => (
                  <HomeworkItem
                    hideCheckbox={homework.progress === null}
                    checked={homework.progress && homework.progress.state_id === 2}
                    title={this.getSubjectName(homework.subject_id)}
                    subtitle={homework.type}
                    onChange={() => {
                      this.props.updateHomeworkProgress(homework.id, !this.isHomeworkDone(homework));
                    }}
                  />
                ))}
              </>
            )}
          </>
        ))}
      </View>
    );
  }

  public render() {
    const { homeworks } = this.props;
    return (
      <View>
        {this.renderNavigationGrid()}
        <ScrollView>{this.renderHomework(homeworks.data)}</ScrollView>
      </View>
    );
  }
}
