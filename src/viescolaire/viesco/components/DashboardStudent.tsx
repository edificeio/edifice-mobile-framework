import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { NavigationActions } from "react-navigation";

import { Icon } from "../../../ui";
import { EmptyScreen } from "../../../ui/EmptyScreen";
import { TextBold } from "../../../ui/text";
import { HomeworkItem } from "../../cdt/components/Items";
import { isHomeworkDone, homeworkDetailsAdapter } from "../../utils/cdt";

const styles = StyleSheet.create({
  dashboardPart: { paddingVertical: 8, paddingHorizontal: 15 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridButtonContainer: {
    width: "50%",
    paddingVertical: 8,
    paddingHorizontal: 6,
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

interface IIconButtonProps {
  disabled?: boolean;
  icon: string;
  color: string;
  text: string;
  onPress: () => void;
}

const IconButton = ({ disabled, icon, color, text, onPress }: IIconButtonProps) => (
  <View style={styles.gridButtonContainer}>
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[styles.gridButton, { backgroundColor: disabled ? "#858FA9" : color }]}>
      <Icon size={20} color="white" name={icon} />
      <Text style={styles.gridButtonText}>{text}</Text>
    </TouchableOpacity>
  </View>
);

export default class Dashboard extends React.PureComponent<any> {
  private renderNavigationGrid() {
    return (
      <View style={[styles.dashboardPart, styles.grid]}>
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
        <IconButton
          onPress={() => this.props.navigation.navigate("Timetable")}
          text={I18n.t("viesco-timetable")}
          color="#162EAE"
          icon="calendar_today"
        />
        <IconButton
          onPress={() => this.props.navigation.navigate("HomeworkList")}
          text={I18n.t("Homework")}
          color="#2BAB6F"
          icon="checkbox-multiple-marked"
        />
        <IconButton
          onPress={() => this.props.navigation.navigate("EvaluationList")}
          text={I18n.t("viesco-tests")}
          color="#F95303"
          icon="equalizer"
        />
      </View>
    );
  }

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
      <View style={styles.dashboardPart}>
        <TextBold style={styles.title}>{I18n.t("viesco-homework")}</TextBold>
        {Object.values(homeworks).length === 0 && (
          <EmptyScreen
            imageSrc={require("../../../../assets/images/empty-screen/empty-homework.png")}
            imgWidth={64}
            imgHeight={64}
            title={I18n.t("viesco-homework-EmptyScreenText")}
          />
        )}
        {Object.keys(homeworksByDate).map(date => (
          <>
            {moment(date).isAfter(moment()) && (
              <>
                <Text style={styles.subtitle}>
                  {moment(date).isSame(tomorrowDate, "day")
                    ? I18n.t("viesco-homework-fortomorrow")
                    : `${I18n.t("viesco-homework-fordate")} ${moment(date).format("DD/MM/YYYY")}`}
                </Text>
                {homeworksByDate[date].map(homework => (
                  <HomeworkItem
                    hideCheckbox={false}
                    checked={isHomeworkDone(homework)}
                    title={homework.subject.name}
                    subtitle={homework.type}
                    onChange={() => {
                      this.props.updateHomeworkProgress(homework.id, !isHomeworkDone(homework));
                    }}
                    onPress={() =>
                      this.props.navigation.navigate(
                        "cdt",
                        {},
                        NavigationActions.navigate({
                          routeName: "HomeworkPage",
                          params: homeworkDetailsAdapter(homework),
                        })
                      )
                    }
                  />
                ))}
              </>
            )}
          </>
        ))}
      </View>
    );
  }

  private renderEvaluations(evaluations) {
    return (
      <View style={styles.dashboardPart}>
        <TextBold style={styles.title}>{I18n.t("viesco-lasteval")}</TextBold>
        <EmptyScreen
          imageSrc={require("../../../../assets/images/empty-screen/empty-evaluations.png")}
          imgWidth={64}
          imgHeight={64}
          title={I18n.t("viesco-eval-EmptyScreenText")}
        />
      </View>
    );
  }

  public render() {
    const { homeworks } = this.props;
    return (
      <View>
        {this.renderNavigationGrid()}
        <ScrollView>
          {this.renderHomework(homeworks.data)}
          {this.renderEvaluations({})}
        </ScrollView>
      </View>
    );
  }
}
