import * as React from "react";
import { StyleSheet, View, Platform } from "react-native";
import { hasNotch } from "react-native-device-info";
import { TouchableOpacity, FlatList, TouchableWithoutFeedback } from "react-native-gesture-handler";
import { Header } from "react-navigation-stack";

import { CommonStyles } from "../../../styles/common/styles";
import { Icon } from "../../../ui";
import { Text } from "../../../ui/Typography";
import { iosStatusBarHeight } from "../../../ui/headers/Header";

type MailContentMenuProps = {
  data: {
    text: string;
    icon: string;
    onPress: () => any;
  }[];
  onClickOutside: () => any;
  show: boolean;
};
export default class MailContentMenu extends React.PureComponent<MailContentMenuProps> {
  public render() {
    const { onClickOutside, show, data } = this.props;
    if (!show) return <></>;
    return (
      <View style={style.overlayActions}>
        <TouchableWithoutFeedback style={{ width: "100%", height: "100%" }} onPress={onClickOutside}>
          <FlatList
            style={style.actions}
            data={data}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={item.onPress}>
                <View style={{ flexDirection: "row", alignItems: "center", padding: 15 }}>
                  <Icon name={item.icon} size={22} style={{ marginRight: 10 }} />
                  <Text>{item.text}</Text>
                </View>
              </TouchableOpacity>
            )}
            refreshing={false}
            ItemSeparatorComponent={() => <View style={style.separator} />}
          />
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

const style = StyleSheet.create({
  actions: {
    backgroundColor: "#ffffff",
    position: "absolute",
    right: 0,
    top: Header.HEIGHT,
    zIndex: 10,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
  overlayActions: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: Platform.OS === "ios" ? (hasNotch() ? iosStatusBarHeight + 20 : iosStatusBarHeight) : -3,
  },
  separator: {
    borderBottomColor: CommonStyles.borderColorVeryLighter,
    borderBottomWidth: 1,
    width: "100%",
  },
});
