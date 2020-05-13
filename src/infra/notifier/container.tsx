import style from "glamorous-native";
import * as React from "react";
import { connect } from "react-redux";
import { AnimatedValue, LayoutEvent } from "react-navigation";
import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui/icons/Icon";
import { Animated, ActivityIndicator, View } from "react-native";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { NotifierType } from "./state";

const NotifierText = style.text({
  color: "#FFFFFF",
  flex: 1,
  textAlign: "center",
  alignSelf: "center"
},
({ noHeight, noMarginLeft  }) => ({
  height: noHeight ? undefined : 40,
  marginLeft: noMarginLeft? undefined : 40
})
);

const NotifierWrapper = style(TouchableOpacity)({
  flex: 1,
  flexDirection: "row"
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
  { fadeAnim: AnimatedValue; slideAnim: AnimatedValue, measuredText: boolean, longText: boolean }
  > {
  previousVisible: boolean = false;

  state = {
    fadeAnim: new Animated.Value(0),
    slideAnim: new Animated.Value(0),
    measuredText: false,
    longText: false
  };

  componentDidMount() {
    this.animate();
  }

  animate() {
    const { visible } = this.props;
    setTimeout(() => {
      if (visible && !this.previousVisible) {
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

      if (!visible && this.previousVisible) {
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
    if (evt.nativeEvent.lines.length > 1) {
      this.setState({ longText: true });
    } else this.setState({ longText: false });
    this.setState({ measuredText: true })
  }

  public render() {
    const { style, text, icon, loading } = this.props;
    const { fadeAnim, slideAnim, measuredText, longText } = this.state;
    return (
      <Animated.View
        style={{
          ...wrapperStyle,
          ...style,
          opacity: fadeAnim,
          height: slideAnim,
        }}
      >
        <NotifierWrapper
          style={{ backgroundColor: this.barColor }}
        >
          <View style={{ flexDirection: "row", flex: 1, ...style }}>
            {text
              ? 
                <NotifierText
                  numberOfLines={3}
                  onTextLayout={this.measureText}
                  noHeight={measuredText && !longText}
                  noMarginLeft={!icon && !loading}
                >
                  {text}
                </NotifierText>
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
