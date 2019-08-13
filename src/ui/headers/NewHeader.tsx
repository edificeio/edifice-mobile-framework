import * as React from "react";
import { connect } from "react-redux";

import { Icon } from "..";
import { CommonStyles } from "../../styles/common/styles";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { NavigationScreenProp } from "react-navigation";
import { ViewStyle, View } from "react-native";
import { Text } from "../text";

// HEADER ICON
const HeaderIconStyle: ViewStyle = {
  alignItems: "center",
  height: 56,
  justifyContent: "center",
  width: 60
};

const iconsDeltaSizes = {
  close: 16
};

export interface IHeaderIconProps {
  name: string;
  hidden?: boolean;
  iconSize?: number;
}
export const HeaderIcon = ({ name, hidden, iconSize }: IHeaderIconProps) => (
  <View style={HeaderIconStyle}><Icon
    size={iconSize || (iconsDeltaSizes as { [key: string]: number })[name] || 20}
    name={name}
    color={hidden ? "transparent" : "#FFFFFF"}
  /></View>
);

// Use this in place React Navigation Back implementation.
export const HeaderBackAction = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => (
  <HeaderAction onPress={() => navigation.goBack()} name={"back"} />
)

// HEADER TEXTS

const HeaderActionText = (props: { [prop: string]: any }) => <View style={{
  paddingHorizontal: 18,
  height: 56,
  justifyContent: "center",
  alignItems: "center"
}}>
  <Text style={{ color: "white" }} {...props} />
</View>;



// HEADER ACTION
export class HeaderAction extends React.PureComponent<{
  name?: string;
  hidden?: boolean;
  iconSize?: number;
  title?: string,
  onPress?: () => void,
}> {
  render() {
    const { name, hidden, onPress, iconSize, title } = this.props;
    return <TouchableOpacity
      onPress={() => onPress && onPress()}
    >
      {name && <HeaderIcon name={name} hidden={hidden} iconSize={iconSize} />}
      {title && <HeaderActionText>{title}</HeaderActionText>}
    </TouchableOpacity>;
  }
}