import style from "glamorous-native";
import * as React from "react";
import { Row } from ".";
import { connect } from "react-redux";
import { CommonStyles } from "../styles/common/styles";
import { Icon } from "./icons/Icon";
import { Animated, ActivityIndicator } from "react-native";
import I18n from "i18n-js";
import TouchableOpacity from "../ui/CustomTouchableOpacity";
import {
  watchConnection,
  checkConnection
} from "../infra/actions/connectionTracker";
const { View } = style;

const TrackerText = style.text({
  color: "#FFFFFF",
  flex: 1,
  textAlign: "center",
  lineHeight: 40,
  marginLeft: 40
});

const TrackingContainer = style(TouchableOpacity)({
  flexDirection: "row",
  flex: 1
});

const container = {
  width: "100%",
  elevation: 4,
  backgroundColor: "#FFFFFF"
};

export class ConnectionTrackingBar extends React.Component<
  {
    connected: boolean;
    watch: () => void;
    check: () => Promise<void>;
    loading: boolean;
    visible: boolean;
    style?: any;
  },
  { fadeAnim; slideAnim }
> {
  previousVisible: boolean;

  state = {
    fadeAnim: new Animated.Value(0),
    slideAnim: new Animated.Value(0)
  };

  componentDidMount() {
    this.props.watch();
    this.animate();
  }

  animate() {
    setTimeout(() => {
      if (this.props.visible && !this.previousVisible) {
        this.previousVisible = true;
        Animated.timing(this.state.fadeAnim, {
          toValue: 1,
          duration: 500
        }).start();

        Animated.timing(this.state.slideAnim, {
          toValue: 40,
          duration: 500
        }).start();
      }

      if (!this.props.visible && this.previousVisible) {
        this.previousVisible = false;
        Animated.timing(this.state.fadeAnim, {
          toValue: 0,
          duration: 500
        }).start();

        Animated.timing(this.state.slideAnim, {
          toValue: 0,
          duration: 500
        }).start();
      }
    }, 200);
  }

  componentDidUpdate() {
    this.animate();
  }

  get iconName(): string {
    if (this.props.loading) {
      return "loading";
    }
    if (this.props.connected) {
      return "checked";
    }
    return "retry";
  }

  get text(): string {
    if (this.props.loading) {
      return "common-connecting";
    }
    if (this.props.connected) {
      return "common-connected";
    }
    return "common-disconnected";
  }

  get barColor(): string {
    if (this.props.loading) {
      return CommonStyles.warning;
    }
    if (this.props.connected) {
      return CommonStyles.success;
    }
    return CommonStyles.error;
  }

  public render() {
    const { fadeAnim, slideAnim } = this.state;
    return (
      <Animated.View
        style={{
          ...container,
          ...this.props.style,
          opacity: fadeAnim,
          height: slideAnim
        }}
      >
        <TrackingContainer
          style={{ backgroundColor: this.barColor }}
          onPress={() => this.props.check()}
        >
          <View style={{ flexDirection: "row", flex: 1 }}>
            <TrackerText>{I18n.t(this.text)}</TrackerText>
            {this.props.loading ? (
              <ActivityIndicator
                size="small"
                color={"#FFFFFF"}
                style={{ marginRight: 80 }}
              />
            ) : (
              <Icon
                name={this.iconName}
                size={18}
                style={{ marginRight: 80, marginTop: 10 }}
                color={"#FFFFFF"}
              />
            )}
          </View>
        </TrackingContainer>
      </Animated.View>
    );
  }
}

export default connect(
  (state: any) => ({
    connected: !!state.connectionTracker.connected,
    loading: !!state.connectionTracker.loading,
    visible: !!state.connectionTracker.visible
  }),
  dispatch => ({
    watch: () => watchConnection(dispatch)(),
    check: () => checkConnection(dispatch)()
  })
)(ConnectionTrackingBar);
