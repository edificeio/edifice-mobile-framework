import * as React from "react";
import { View } from "react-native";
import { connect } from "react-redux";
import styles, { deviceWidth } from "../styles";


interface ProgressBarProps {
  value: number;
}

class ProgressBar extends React.Component<ProgressBarProps> {

  public render() {
    const { value } = this.props;
    const width = value ? (value * deviceWidth) / 100 : 0

    return value > 0 && value < 100 ? (
      <View style={[styles.loading, { width}]} />
    ) : (
      <View />
    );
  }
}

const mapStateToProps = (state:any) => ({
  value: [state.progress.value]
});

export default connect(
  mapStateToProps
)(ProgressBar);
