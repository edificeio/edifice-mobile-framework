import React from "react";
import { StyleSheet } from "react-native";

import { Icon } from "../../ui";
import { TextH1, TextColor } from "../../ui/text";
import { TouchCard } from "../../ui/Card";
import { ArticleContainer } from "../../ui/ContainerContent";
import { checkHasIcon } from "../../ui/icons/Icon";
import {HALF_WIDTH, layoutSize} from "../../styles/common/layoutSize";
import {CommonStyles} from "../../styles/common/styles";

const MyAppItemStyle = StyleSheet.create({
  touchCard: {
    width: HALF_WIDTH(layoutSize.LAYOUT_10),
    height: layoutSize.LAYOUT_100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: layoutSize.LAYOUT_10,
    padding: 0
  },

  textStyle: {
    color: TextColor.Normal,
    fontSize: layoutSize.LAYOUT_14,
    marginBottom: 0,
    marginTop: 0,
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
      <TouchCard style={MyAppItemStyle.touchCard} onPress={props.onPress}>
        <Icon
          color={props.iconColor}
          size={layoutSize.LAYOUT_50}
          name={checkHasIcon(props.iconName) ? props.iconName : props.iconName + "-on"}
        />
        <TextH1 numberOfLines={1} style={MyAppItemStyle.textStyle}>{props.displayName}</TextH1>
      </TouchCard>
  );
};
