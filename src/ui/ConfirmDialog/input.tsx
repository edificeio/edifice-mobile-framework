import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { layoutSize } from "../../styles/common/layoutSize";

type IProps = {
  value: string;
  onChangeText: (event) => void;
};

export default class DialogInput extends React.PureComponent<IProps> {
  static displayName = "DialogInput";

  render() {
    const { value, ...otherProps } = this.props;
    return <TextInput autoFocus style={styles.textInput} value={value} {...otherProps} />
  }
}

const styles = StyleSheet.create({
  textInput: {
    color: "#21212138",
    fontSize: layoutSize.LAYOUT_16,
    borderColor: "#00000012",
    borderBottomWidth: 1,
    marginBottom: layoutSize.LAYOUT_14,
  },
});
