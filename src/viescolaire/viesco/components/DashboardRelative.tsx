import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { NavigationActions } from "react-navigation";

import { INavigationProps } from "../../../types";
import { Icon, Loading } from "../../../ui";
import TouchableOpacity from "../../../ui/CustomTouchableOpacity";
import { EmptyScreen } from "../../../ui/EmptyScreen";
import { Text, TextBold } from "../../../ui/text";
import { HomeworkItem } from "../../cdt/components/Items";
import { DenseDevoirList } from "../../competences/components/Item";
import { ILevelsList } from "../../competences/state/competencesLevels";
import { IDevoirListState } from "../../competences/state/devoirs";
import { isHomeworkDone, homeworkDetailsAdapter } from "../../utils/cdt";
import ChildPicker from "../containers/ChildPicker";

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
  declareAbsenceButton: {
    backgroundColor: "#FCB602",
    paddingHorizontal: 5,
    justifyContent: "center",
    alignSelf: "stretch",
    borderRadius: 5,
  },
});

type DashboardProps = {
  homeworks: any[];
  evaluations: IDevoirListState;
  levels: ILevelsList;
  hasRightToCreateAbsence: boolean;
} & INavigationProps;

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

export default class Dashboard extends React.PureComponent<DashboardProps> {
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
                  user_type: "Relative",
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
    Object.values(homeworks.data).forEach(hm => {
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
        {Object.values(homeworks.data).length === 0 && (
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
                    disabled
                    checked={isHomeworkDone(homework)}
                    title={homework.subject.name}
                    subtitle={homework.type}
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

  // Get the 5 last added evaluations
  //Sort evaluations by dates, then by alphabetical order then by notes
  getSortedEvaluationList = (evaluations: IDevoirListState) => {
    return evaluations.data
      .sort(
        (a, b) =>
          moment(b.date).diff(moment(a.date)) ||
          String(a.matiere.toLocaleLowerCase() ?? "").localeCompare(b.matiere.toLocaleLowerCase() ?? "") ||
          Number(a.note) - Number(b.note)
      )
      .slice(0, 5);
  };

  private renderLastEval(evaluations: IDevoirListState, levels: ILevelsList) {
    const evaluationList = this.getSortedEvaluationList(evaluations);
    return (
      <View style={styles.dashboardPart}>
        <TextBold style={styles.title}>{I18n.t("viesco-lasteval")}</TextBold>
        {evaluations && evaluations.data ? (
          <DenseDevoirList devoirs={evaluationList} levels={levels} />
        ) : (
          <EmptyScreen
            imageSrc={require("../../../../assets/images/empty-screen/empty-evaluations.png")}
            imgWidth={64}
            imgHeight={64}
            title={I18n.t("viesco-eval-EmptyScreenText")}
          />
        )}
      </View>
    );
  }

  public render() {
    const { homeworks, evaluations, hasRightToCreateAbsence, levels } = this.props;

    return (
      <View style={{ flex: 1 }}>
        <ChildPicker>
          {hasRightToCreateAbsence && (
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate("Declaration")}
              style={styles.declareAbsenceButton}>
              <TextBold style={{ color: "#FFFFFF" }}>{I18n.t("viesco-declareAbsence")}</TextBold>
            </TouchableOpacity>
          )}
        </ChildPicker>

        <ScrollView>
          {this.renderNavigationGrid()}
          {this.renderHomework(homeworks)}
          {evaluations.isFetching ? <Loading /> : this.renderLastEval(evaluations, levels)}
        </ScrollView>
      </View>
    );
  }
}
