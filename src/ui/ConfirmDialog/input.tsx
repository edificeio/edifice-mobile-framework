import React from "react";
import { StyleSheet, TextInput } from "react-native";
import { layoutSize } from "../../styles/common/layoutSize";

type IProps = {
  value: string,
  onChangeText: (event) => void,
};

export default class DialogInput extends React.PureComponent<IProps> {
  static displayName = "DialogInput";

  render() {
    const { ...otherProps } = this.props;
    return (
      <TextInput autoFocus underlineColorAndroid="#eeeeee" style={styles.textInput} {...otherProps} />
    );
  }
}

const styles = StyleSheet.create({
  textInput: {
    height: layoutSize.LAYOUT_40,
    marginLeft: 10,
    marginTop: layoutSize.LAYOUT_10,
    marginBottom: layoutSize.LAYOUT_20,
    color: "#777777",
    fontSize: layoutSize.LAYOUT_16,
  },
});
