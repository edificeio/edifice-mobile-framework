import I18n from "i18n-js";
import * as React from "react";
import { View, StyleSheet } from "react-native";

import { CommonStyles } from "../../../styles/common/styles";
import TouchableOpacity from "../../../ui/CustomTouchableOpacity";
import Dropdown from "../../../ui/Dropdown";
import { Text } from "../../../ui/text";
import { IChildArray, IChild } from "../state/children";

const styles = StyleSheet.create({
  shadow: {
    elevation: CommonStyles.elevation,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
  },
  container: {
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    backgroundColor: "#FFFFFF",
    zIndex: 100,
  },
  innerContainer: {
    paddingBottom: 10,
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  declareAbsenceButton: { backgroundColor: "#FCB602", padding: 10, margin: 10, borderRadius: 5 },
});

export default class ChildPicker extends React.PureComponent<{
  selectedChild: string;
  children: IChildArray;
  selectChild: (t: string) => void;
  declareAbsence: (t: string) => void;
}> {
  public render() {
    const { selectedChild, children, selectChild, declareAbsence } = this.props;

    const keyExtractor = child => Object.keys(children)[Object.values(children).findIndex(item => item == child)];

    return (
      <View style={[styles.container, styles.shadow]}>
        <View style={styles.innerContainer}>
          <Dropdown
            data={Object.values(children)}
            value={selectedChild}
            onSelect={(child: string) => selectChild(child)}
            keyExtractor={item => keyExtractor(item)}
            renderItem={(item: IChild) => item.lastName + " " + item.firstName}
          />
          <TouchableOpacity onPress={() => declareAbsence(selectedChild)} style={styles.declareAbsenceButton}>
            <Text>{I18n.t("viesco-declareAbsence")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
