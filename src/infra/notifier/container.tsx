import style from "glamorous-native";
import * as React from "react";
import { Animated, ActivityIndicator, View, Text, Platform } from "react-native";
import { connect } from "react-redux";
import { AnimatedValue, LayoutEvent } from "react-navigation";
import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui/icons/Icon";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { NotifierType } from "./state";

const NotifierWrapper = style(TouchableOpacity)({
  flex: 1,
  flexDirection: "row"
});

class Notifier extends React.Component<
  {
    notifierType: NotifierType;
    text?: string;
    icon?: string;
    loading?: boolean;
    visible: boolean;
    style?: any;
  },
  { fadeAnim: AnimatedValue; slideAnim: AnimatedValue, measuredText: boolean, longText: boolean, notifierHeight: number }
  > {
  previousVisible: boolean = false;

  state = {
    fadeAnim: new Animated.Value(0),
    slideAnim: new Animated.Value(0),
    measuredText: false,
    longText: false,
    notifierHeight: 0,
  };

  animate() {
    const { visible } = this.props;
    const { notifierHeight, fadeAnim, slideAnim } = this.state;

    if (notifierHeight > 0) {
      setTimeout(() => {
        if (visible && !this.previousVisible) {
          this.previousVisible = true;
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500
          }).start();

          Animated.timing(slideAnim, {
            toValue: notifierHeight,
            duration: 500
          }).start();
        }

        if (!visible && this.previousVisible) {
          this.previousVisible = false;
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500
          }).start();

          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500
          }).start();
        }
      }, 200)
    }
  }

  get barColor(): string {
    const { notifierType } = this.props;
    const type = notifierType || 'info';
    return ({
      info: CommonStyles.primary,
      success: CommonStyles.success,
      warning: CommonStyles.warning,
      error: CommonStyles.error
    })[type];
  }

  public measureText = (evt: LayoutEvent) => {
    const textBlockHeight = evt.nativeEvent.lines[0].height * evt.nativeEvent.lines.length;
    evt.nativeEvent.lines.length > 1
    ? this.setState({ measuredText: true, longText: true, notifierHeight: textBlockHeight })
    : this.setState({ measuredText: true, longText: false, notifierHeight: 40 })
  }

  componentDidMount() {
    this.animate();
  }
  
  componentDidUpdate() {
    this.animate();
  }

  public render() {
    const { style, text, icon, loading } = this.props;
    const { fadeAnim, slideAnim, measuredText, longText, notifierHeight } = this.state;
    const heightIos = measuredText && !longText ? undefined : notifierHeight;
    const height = Platform.OS === "ios" ? heightIos : undefined;
    const marginLeft = !icon && !loading ? undefined : 40;

    return (
      <Animated.View
        style={{
          ...style,
          width: "100%",
          backgroundColor: "#FFFFFF",
          elevation: 6,
          opacity: fadeAnim,
          height: slideAnim,
        }}
      >
        <NotifierWrapper
          style={{ backgroundColor: this.barColor }}
        >
          <View
            style={[
              { flexDirection: "row", flex: 1, ...style },
              icon && !loading && { alignItems: "center" }
            ]}
          >
            {text
              ? 
                <Text
                  onTextLayout={this.measureText}
                  style={{
                    flex: 1,
                    color: "#FFFFFF",
                    textAlign: "center",
                    alignSelf: "center",
                    height,
                    marginLeft
                  }}
                >
                  {text}
                </Text>
              : 
                null
            }
            {loading ? (
              <ActivityIndicator
                size="small"
                color={"#FFFFFF"}
                style={{ marginRight: 20 }}
              />
            ) : icon ? (
              <Icon
                name={icon}
                size={18}
                style={{ marginRight: 20 }}
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
