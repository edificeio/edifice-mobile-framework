import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Text, TouchableOpacity, Icon } from "../../../ui";

const style = StyleSheet.create({});

const IconButton = ({ icon, color, text, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[style.gridButton, { backgroundColor: color }]}>
      <Icon size={20} color={"white"} name={icon} />
      <Text style={style.gridButtonText}>{text}</Text>
    </TouchableOpacity>
  );
};

export default class Dashboard extends React.PureComponent<any> {
  private renderNavigationGrid() {
    return (
      <View style={[style.dashboardPart, style.grid]}>
        <View style={style.gridButtonContainer}>
          <IconButton onPress={() => true} text={"Emploi du temps"} color={"#162EAE"} icon={"reservation"} />
        </View>
        <View style={style.gridButtonContainer}>
          <IconButton onPress={() => true} text={"Cahier de texte"} color={"#2BAB6F"} icon={"reservation"} />
        </View>
      </View>
    );
  }

  public render() {
    return (
      <View>
        <StructurePicker onChange={val => console.log(val)} />
        {this.renderNavigationGrid()}
      </View>
    );
  }
}
