import * as React from "react";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Icon } from "../../../ui";
import { TextBold } from "../../../ui/text";
import { HomeworkItem } from "../../cdt/components/homework";
import moment from "moment";

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
        <Icon size={20} color={"white"} name={icon} />
        <Text style={style.gridButtonText}>{text}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default class Dashboard extends React.PureComponent<any & dashboardProps> {
  private renderNavigationGrid() {
    return (
      <View style={[style.dashboardPart, style.grid]}>
        <IconButton onPress={() => true} text={"Historique"} color={"#FCB602"} icon={"reservation"} />
        <IconButton onPress={() => true} text={"Emploi du temps"} color={"#162EAE"} icon={"reservation"} />
        <IconButton
          onPress={() => this.props.navigation.navigate("HomeworkList", { user_type: "Student" })}
          text={"Cahier de texte"}
          color={"#2BAB6F"}
          icon={"reservation"}
        />
        <IconButton onPress={() => true} text={"Evaluations"} color={"#F95303"} icon={"reservation"} />
      </View>
    );
  }

  private renderHomework(homeworks) {
    let homeworksByDate = {};
    homeworks.forEach((hm) => {
      const key = moment(hm.date).format('YYYY-MM-DD');
      if(typeof homeworksByDate[key] === 'undefined') homeworksByDate[key] = [];
      homeworksByDate[key].push(hm);
    });

    const tomorrowDate = moment().add(1, 'day');

    homeworksByDate = Object.keys(homeworksByDate).sort().slice(0, 5).reduce(function(memo, current) { 
        memo[current] = homeworksByDate[current]
        return memo;
      }, {}
    );

    return (
      <View style={style.dashboardPart}>
        <TextBold style={style.title}>Travail à faire</TextBold>
        {Object.keys(homeworksByDate).map(date => (
          <>
          <Text style={style.subtitle}>
            Pour {moment(date).isSame(tomorrowDate, 'day') ? 'demain' : `le ${moment(date).format('DD/MM/YYYY')}`}
          </Text>
          {homeworksByDate[date].map(homework => (
            <HomeworkItem checked={homework.completed} title={homework.subject} subtitle={homework.type} />
          ))}
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
        <ScrollView>{this.renderHomework(homeworks)}</ScrollView>
      </View>
    );
  }
}
