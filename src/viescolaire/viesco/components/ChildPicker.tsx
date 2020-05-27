import I18n from "i18n-js";
import * as React from "react";
import { View, StyleSheet } from "react-native";

import { CommonStyles } from "../../../styles/common/styles";
import TouchableOpacity from "../../../ui/CustomTouchableOpacity";
import { Text } from "../../../ui/text";

const style = StyleSheet.create({
  shadow: {
    elevation: 3,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
  },
  container: {
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    backgroundColor: "#FFFFFF",
  },
  innerContainer: {
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
});

const Picker = () => {
  
}

export class ChildPicker extends React.PureComponent<{
  selectedChild: any;
  children: any[];
  onChange: (t: any) => any;
  onAbsence: (t: any) => any;
}> {
  public render() {
    const { children, onChange, onAbsence } = this.props;
    return (
      <View style={[style.container, style.shadow]}>
        <View style={style.innerContainer}>
          <TouchableOpacity
            onPress={onAbsence}
            style={{ backgroundColor: "#FCB602", padding: 10, margin: 10, borderRadius: 5 }}>
            <Text>{I18n.t("viesco-declareAbsence")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
