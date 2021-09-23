import React from "react";
import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import I18n from "i18n-js";
import { layoutSize } from "../../styles/common/layoutSize";

type IProps = {
  onPress: (any) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default class DialogButton extends React.PureComponent<IProps> {
  static displayName = "DialogButton";

  render() {
    const { onPress, style, textStyle } = this.props;

    return (
      <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
        <Text style={[styles.text, textStyle]}>{I18n.t("Cancel")}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 2,
    backgroundColor: "#C0C0C0",
    paddingHorizontal: layoutSize.LAYOUT_16,
    paddingVertical: layoutSize.LAYOUT_8,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    textAlign: "center",
    backgroundColor: "transparent",
    fontSize: layoutSize.LAYOUT_14,
  },
});
