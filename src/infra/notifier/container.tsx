import style from "glamorous-native";
import * as React from "react";
import { connect } from "react-redux";
import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui/icons/Icon";
import { Animated, ActivityIndicator, View } from "react-native";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { AnimatedValue } from "react-navigation";
import { NotifierType } from "./state";

const NotifierText = style.text({
  color: "#FFFFFF",
  flex: 1,
  textAlign: "center",
  lineHeight: 40,
  marginLeft: 40
});

const NotifierWrapper = style(TouchableOpacity)({
  flexDirection: "row",
  flex: 1
});

const wrapperStyle = {
  width: "100%",
  elevation: 6,
  backgroundColor: "#FFFFFF"
};

class Notifier extends React.Component<
  {
    notifierType: NotifierType;
    text?: string;
    icon?: string;
    loading?: boolean;
    visible: boolean;
    style?: any;
  },
  { fadeAnim: AnimatedValue; slideAnim: AnimatedValue }
  > {
  previousVisible: boolean = false;

  state = {
    fadeAnim: new Animated.Value(0),
    slideAnim: new Animated.Value(0)
  };

  componentDidMount() {
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

  get barColor(): string {
    const type = this.props.notifierType || 'info';
    return ({
      info: CommonStyles.primary,
      success: CommonStyles.success,
      warning: CommonStyles.warning,
      error: CommonStyles.error
    })[type];
  }

  public render() {
    const { fadeAnim, slideAnim } = this.state;
    return (
      <Animated.View
        style={{
          ...wrapperStyle,
          ...this.props.style,
          opacity: fadeAnim,
          height: slideAnim
        }}
      >
        <NotifierWrapper
          style={{ backgroundColor: this.barColor }}
        >
          <View style={{ flexDirection: "row", flex: 1 }}>
            {this.props.text ? <NotifierText>{this.props.text}</NotifierText> : null}
            {this.props.loading ? (
              <ActivityIndicator
                size="small"
                color={"#FFFFFF"}
                style={{ marginRight: 20 }}
              />
            ) : this.props.icon ? (
              <Icon
                name={this.props.icon}
                size={18}
                style={{ marginRight: 20, marginTop: 10 }}
                color={"#FFFFFF"}
              />
            ) : null}
          </View>
        </NotifierWrapper>
      </Animated.View>
    );
  }
}

export default connect(
  (state: any) => ({
    ...state.notifier
  })
)(Notifier);
