import React from "react";
import { StyleSheet, View } from "react-native";

import { Icon } from "../../ui";
import { TextH1, TextColor } from "../../ui/text";
import { TouchCard } from "../../ui/Card";
import { checkHasIcon } from "../../ui/icons/Icon";
import { layoutSize} from "../../styles/common/layoutSize";

const MyAppItemStyle = StyleSheet.create({
  gridItem: {
    flex:0,
    padding: 20,
    width: "50%",
    aspectRatio:1
  },
  touchCard: {
    flex:1,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  textStyle: {
    color: TextColor.Normal,
    fontSize: layoutSize.LAYOUT_14,
    textAlign:"center",
    marginBottom: 0,
    marginTop: 0,
    marginHorizontal: 0,
    padding: 0
  },
});

export interface IMyAppItem {
  iconColor: string;
  displayName: string;
  iconName: string;
  onPress: () => void;
}

export default (props: IMyAppItem) => {
  return (
    <View style={MyAppItemStyle.gridItem}>
      <TouchCard style={MyAppItemStyle.touchCard} onPress={props.onPress}>
        <Icon
          color={props.iconColor}
          size={layoutSize.LAYOUT_50}
          name={checkHasIcon(props.iconName) ? props.iconName : props.iconName + "-on"}
        />
        <TextH1 style={MyAppItemStyle.textStyle}>{props.displayName}</TextH1>
      </TouchCard>
      </View>
  );
};
