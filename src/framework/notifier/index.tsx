import style from "glamorous-native";
import * as React from "react";
import { Animated, ActivityIndicator, View, Text, Platform, LayoutEvent } from "react-native";
import { connect } from "react-redux";
import { AnimatedValue } from "react-navigation";
import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui/icons/Icon";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { NotifierState } from "./reducer";

const NotifierWrapper = style(TouchableOpacity)({
  flex: 1,
  flexDirection: "row"
});

class Notifier extends React.Component<
  {
    id: string;
    notifiers: {
      [key: string]: NotifierState
    };
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
    const { id } = this.props;
    const { notifierHeight, fadeAnim, slideAnim } = this.state;
    const notifier = this.props.notifiers[id];
    const visible = notifier && notifier.visible;

    if (notifierHeight > 0) {
      setTimeout(() => {
        if (visible && !this.previousVisible) {
          this.previousVisible = true;
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false
          }).start();

          Animated.timing(slideAnim, {
            toValue: notifierHeight,
            duration: 500,
            useNativeDriver: false
          }).start();
        }

        if (!visible && this.previousVisible) {
          this.previousVisible = false;
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false
          }).start();

          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false
          }).start();
        }
      }, 200)
    }
  }

  get barColor(): string {
    const { id } = this.props;
    const notifier = this.props.notifiers[id];
    const type = notifier && notifier.notifierType || 'info';
    
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
    ? this.setState({ measuredText: true, longText: true, notifierHeight: textBlockHeight + 30 })
    : this.setState({ measuredText: true, longText: false, notifierHeight: 40 })
  }

  componentDidMount() {
    this.animate();
  }
  
  componentDidUpdate() {
    this.animate();
  }

  public render() {
    const { style, id } = this.props;
    const { fadeAnim, slideAnim, measuredText, longText, notifierHeight } = this.state;
    const notifier = this.props.notifiers[id];
    const loading = notifier && notifier.loading;
    const text = notifier && notifier.text;
    const icon = notifier && notifier.icon;
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
                    textAlign: longText ? "left" : "center",
                    alignSelf: "center",
                    height,
                    marginLeft,
                    paddingTop: longText ? 15 : undefined,
                    paddingBottom: longText ? 15 : undefined
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
    notifiers: state.notifiers
  })
)(Notifier);
