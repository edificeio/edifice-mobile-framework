import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { layoutSize } from "../../styles/common/layoutSize";
import I18n from "i18n-js";

type IProps = {
  onPress: (any) => void;
};

export default class DialogButton extends React.PureComponent<IProps> {
  static displayName = "DialogButton";

  render() {
    const { onPress } = this.props;

    return (
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.text}>{I18n.t("Cancel")}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 3,
    backgroundColor: "#C0C0C0",
    paddingHorizontal: layoutSize.LAYOUT_12,
    paddingVertical: layoutSize.LAYOUT_8,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: 'white',
    textAlign: "center",
    backgroundColor: "transparent",
    fontSize: layoutSize.LAYOUT_15,
  },
});
