import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import {layoutSize} from "../../styles/common/layoutSize";

type IProps = {
  label: string;
  disabled: boolean;
  onPress: (any) => void;
};

export default class DialogButton extends React.PureComponent<IProps> {
  static defaultProps = {
    disabled: false,
  };

  static displayName = "DialogButton";

  render() {
    const { onPress, disabled, label } = this.props;

    return (
      <TouchableOpacity style={[styles.button, disabled ? styles.disabled : {}]} onPress={onPress} disabled={disabled}>
        <Text style={styles.text}>{label}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FF8000",
    borderRadius: 2,
    marginLeft: layoutSize.LAYOUT_16,
    paddingHorizontal: layoutSize.LAYOUT_16,
    paddingVertical: layoutSize.LAYOUT_8,
    justifyContent: "center",
    alignItems: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: 'white',
    textAlign: "center",
    backgroundColor: "transparent",
    fontFamily:"roboto",
    fontSize: layoutSize.LAYOUT_14,
  },
});
