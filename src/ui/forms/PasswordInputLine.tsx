import * as React from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { TextInputLine, TextInputLineProps } from "./TextInputLine";
import { TextColor } from "../text";
import { Icon } from "..";

export class PasswordInputLine extends React.Component<
  {
    iconShow?: string;
    iconHide?: string;
  } & TextInputLineProps,
  { hide: boolean; showHideController: boolean }
> {
  public state = {
    hide: true,
    showHideController: false,
  };

  public render() {
    const { iconShow = "eye", iconHide = "eye-slash" } = this.props;

    return (
      <View style={{ alignSelf: "stretch", flex: 0 }}>
        <TextInputLine
          secureTextEntry={this.state.hide}
          clearTextOnFocus={false}
          onChange={({ nativeEvent: { eventCount, target, text } }) => {
            if (Platform.OS === "ios") return;
            this.setState({
              showHideController: (text as unknown) as boolean,
            });
          }}
          {...this.props}
          style={{
            paddingRight: 32,
            flex: 0,
            ...(this.props.style as object),
          }}
        />
        {this.state.showHideController ? (
          <TouchableOpacity
            onPress={() => {
              this.setState({ hide: !this.state.hide });
            }}
            style={{
              bottom: 8,
              position: "absolute",
              right: 8,
            }}>
            <Icon name={this.state.hide ? iconShow : iconHide} size={16} color={TextColor.Normal} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }
}
