import React from "react";
import { StyleSheet } from "react-native";

import { Icon } from "../../ui";
import { TextH1, TextColor } from "../../ui/text";
import { TouchCard } from "../../ui/Card";
import { ArticleContainer } from "../../ui/ContainerContent";

const MyAppItemStyle = StyleSheet.create({
  flexItem: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    flex: 0.5,
    height: 180,
    justifyContent: "space-around",
    alignContent: "space-around",
    alignItems: "center",
  },

  touchCard: {
    height: "80%",
    width: "80%",
    alignItems: "center",
    justifyContent: "space-evenly",
  },

  textStyle: {
    color: TextColor.Normal,
    marginBottom: 0,
    marginTop: 0,
  },
});

export interface IMyAppItem {
  displayName:string,
  iconName:string,
  onPress:() => void
}

export default (props: IMyAppItem) => {
  return (
    <ArticleContainer style={MyAppItemStyle.flexItem}>
      <TouchCard style={MyAppItemStyle.touchCard} onPress={props.onPress}>
        <Icon size={50} name={props.iconName+"-on"} />
        <TextH1 style={MyAppItemStyle.textStyle}>{props.displayName}</TextH1>
      </TouchCard>
    </ArticleContainer>
  );
};
