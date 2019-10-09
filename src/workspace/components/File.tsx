import * as React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { Text } from "../../ui/text";
import { CenterPanel, Content, LeftPanel } from "../../ui/ContainerContent";

const style = StyleSheet.create({
  containerStyle: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: CommonStyles.borderBottomItem,
    flexDirection: "row",
    borderBottomWidth: 1,
  },
});

export default ({ id, name, date, number }: any) => {
  return (
    <TouchableOpacity style={style.containerStyle} onPress={() => true}>
      <LeftPanel>
        <Icon name="folder" />
      </LeftPanel>
      <CenterPanel>
        <Text>{name}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Content>{date}</Content>
          <Content>{number}</Content>
        </View>
      </CenterPanel>
    </TouchableOpacity>
  );
};
