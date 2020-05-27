import * as React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, TextBold, TouchableOpacity, Icon } from "../../../ui";
import { LeftColoredItem, CheckBoxItem } from "./Item";

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

const IconButton = ({ icon, color, text, onPress }) => {
  return (
    <View style={style.gridButtonContainer}>
      <TouchableOpacity onPress={onPress} style={[style.gridButton, { backgroundColor: color }]}>
        <Icon size={20} color={"white"} name={icon} />
        <Text style={style.gridButtonText}>{text}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default class Dashboard extends React.PureComponent<dashboardProps> {
  private renderNavigationGrid() {
    return (
      <View style={[style.dashboardPart, style.grid]}>
        <IconButton onPress={() => true} text={"Historique"} color={"#FCB602"} icon={"reservation"} />
        <IconButton onPress={() => true} text={"Emploi du temps"} color={"#162EAE"} icon={"reservation"} />
        <IconButton onPress={() => true} text={"Cahier de texte"} color={"#2BAB6F"} icon={"reservation"} />
        <IconButton onPress={() => true} text={"Evaluations"} color={"#F95303"} icon={"reservation"} />
      </View>
    );
  }

  private renderHomework(homeworks) {
    return (
      <View style={style.dashboardPart}>
        <TextBold style={style.title}>Travail à faire</TextBold>
        <Text style={style.subtitle}>Pour demain</Text>
        {homeworks.map(({ completed, subject, type }) => (
          <CheckBoxItem checked={completed} title={subject} subtitle={type} />
        ))}
      </View>
    );
  }

  public render() {
    const { homeworks } = this.props;
    return (
      <View>
        {this.renderNavigationGrid()}
        <ScrollView>{this.renderHomework(homeworks)}</ScrollView>
      </View>
    );
  }
}
