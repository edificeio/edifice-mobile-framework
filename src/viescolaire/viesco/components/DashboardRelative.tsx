import * as React from "react";
import { View, StyleSheet, ScrollView } from "react-native";

//import I18n from "../../../infra/i18n";
import I18n from "i18n-js"
import { Icon } from "../../../ui";
import TouchableOpacity from "../../../ui/CustomTouchableOpacity";
import { Text, TextBold } from "../../../ui/text";
import { HomeworkItem } from "../../cdt/components/homework";
import { DenseDevoirList } from "../../competences/components/Item";
import ChildPicker from "../containers/ChildPicker";

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
  children: any[];
  homeworks: any[];
  evaluations: any[];
  selectChild: (child) => void;
};

const IconButton = ({ icon, color, text, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[style.gridButton, { backgroundColor: color }]}>
      <Icon size={20} color="white" name={icon} />
      <TextBold style={style.gridButtonText}>{text}</TextBold>
    </TouchableOpacity>
  );
};

export default class Dashboard extends React.PureComponent<any & DashboardProps> {
  private renderNavigationGrid() {
    return (
      <View style={[style.dashboardPart, style.grid]}>
        <View style={style.gridButtonContainer}>
          <IconButton onPress={() => true} text="Historique" color="#FCB602" icon="reservation" />
        </View>
        <View style={style.gridButtonContainer}>
          <IconButton onPress={() => true} text="Emploi du temps" color="#162EAE" icon="reservation" />
        </View>
        <View style={style.gridButtonContainer}>
          <IconButton onPress={() => this.props.navigation.navigate("HomeworkListRelative")} text="Cahier de texte" color="#2BAB6F" icon="reservation" />
        </View>
        <View style={style.gridButtonContainer}>
          <IconButton onPress={() => true} text="Evaluations" color="#F95303" icon="reservation" />
        </View>
      </View>
    );
  }

  private renderHomework(homeworks) {
    return (
      <View style={style.dashboardPart}>
        <TextBold style={style.title}>Travail à faire</TextBold>
        <Text style={style.subtitle}>Pour demain</Text>
        {homeworks.map(({ completed, subject, type }) => (
          <HomeworkItem disabled checked={completed} title={subject} subtitle={type} />
        ))}
      </View>
    );
  }

  private renderLastEval(evaluations) {
    return (
      <View style={style.dashboardPart}>
        <TextBold style={style.title}>{I18n.t("viesco-lasteval")}</TextBold>
        <DenseDevoirList devoirs={evaluations} />
      </View>
    );
  }

  public render() {
    const { homeworks, evaluations } = this.props;

    return (
      <View style={{ flex: 1 }}>
        <ChildPicker />
        {this.renderNavigationGrid()}
        <ScrollView>
          {this.renderHomework(homeworks)}
          {this.renderLastEval(evaluations)}
        </ScrollView>
      </View>
    );
  }
}
