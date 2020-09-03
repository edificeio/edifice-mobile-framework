import I18n from "i18n-js";
import moment from "moment";
import * as React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { NavigationActions } from "react-navigation";

//import I18n from "../../../infra/i18n";
import { Icon } from "../../../ui";
import TouchableOpacity from "../../../ui/CustomTouchableOpacity";
import { EmptyScreen } from "../../../ui/EmptyScreen";
import { Text, TextBold } from "../../../ui/text";
import { HomeworkItem } from "../../cdt/components/Items";
import ChildPicker from "../containers/ChildPicker";
import { isHomeworkDone, getSubjectName, homeworkDetailsAdapter } from "../../utils/cdt";
import { INavigationProps } from "../../../types";

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
  evaluations: any[];
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
      style={[styles.gridButton, { backgroundColor: color }, { opacity: disabled ? 0.6 : 1 }]}>
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
          disabled
          onPress={() => true}
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
          disabled
          onPress={() => this.props.navigation.navigate("EvaluationList")}
          text={I18n.t("viesco-tests")}
          color="#F95303"
          icon="equalizer"
        />
      </View>
    );
  }

  private renderHomework(homeworks) {
    const tomorrowHomeworks = Object.values(homeworks.data).filter(hmk =>
      hmk.due_date.isSame(moment().add(1, "day"), "day")
    );
    return (
      <View style={styles.dashboardPart}>
        <TextBold style={styles.title}>{I18n.t("viesco-homework")}</TextBold>
        <Text style={styles.subtitle}>{I18n.t("viesco-homework-fortomorrow")}</Text>
        {tomorrowHomeworks.length === 0 && (
          <EmptyScreen
            imageSrc={require("../../../../assets/images/empty-screen/empty-homework.png")}
            imgWidth={64}
            imgHeight={64}
            title={I18n.t("viesco-homework-EmptyScreenText")}
          />
        )}
        {tomorrowHomeworks.map(homework => (
          <HomeworkItem
            disabled
            checked={isHomeworkDone(homework)}
            title={getSubjectName(homework.subject_id, this.props.subjects.data)}
            subtitle={homework.type}
            onPress={() =>
              this.props.navigation.navigate(
                "cdt",
                {},
                NavigationActions.navigate({
                  routeName: "HomeworkPage",
                  params: homeworkDetailsAdapter(homework, this.props.subjects.data),
                })
              )
            }
          />
        ))}
      </View>
    );
  }

  private renderLastEval(evaluations) {
    // return (
    //   <View style={styles.dashboardPart}>
    //     <TextBold style={styles.title}>{I18n.t("viesco-lasteval")}</TextBold>
    //     <DenseDevoirList devoirs={evaluations} />
    //   </View>
    // );
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
    const { homeworks, evaluations } = this.props;

    return (
      <View style={{ flex: 1 }}>
        <ChildPicker>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate("Declaration")}
            style={styles.declareAbsenceButton}>
            <TextBold style={{ color: "#FFFFFF" }}>{I18n.t("viesco-declareAbsence")}</TextBold>
          </TouchableOpacity>
        </ChildPicker>

        <ScrollView>
          {this.renderNavigationGrid()}
          {this.renderHomework(homeworks)}
          {this.renderLastEval(evaluations)}
        </ScrollView>
      </View>
    );
  }
}
