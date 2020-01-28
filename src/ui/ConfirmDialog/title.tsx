import React from "react";
import { StyleSheet, Text } from "react-native";

export default class DialogTitle extends React.PureComponent {
  static displayName = "DialogTitle";

  render() {
    const { children } = this.props;
    return <Text style={styles.text}>{children}</Text>;
  }
}

const styles = StyleSheet.create({
  text: {
    fontWeight: "500",
    fontSize: 18,
  },
});
