/**
 * DiaryDayCheckpoint
 *
 * Just a wrapper for the heading of a day tasks. Displays a day number in a circle and a day name
 * Props:
 *     style - Glamorous style to add.
 * 	   nb - Day number to be displayed in a `DiaryDayCircleNumber`.
 *     text - Day name to be displayed.
 *     active - An active `DiaryDayCheckpoint` will be highlighted. Default `false`.
 */

import style from "glamorous-native";
import * as React from "react";
const { View, Text } = style;
import { CommonStyles } from "../../styles/common/styles";

import DiaryCircleNumber from "./DiaryCircleNumber";

// tslint:disable-next-line:variable-name
const DiaryDayCheckpoint = ({
  style,
  nb,
  text = "",
  active = false
}: {
  style?: any;
  nb?: number;
  text?: string;
  active?: boolean;
}) => (
  <View style={[style]}>
    <DiaryCircleNumber nb={nb} active={active} />
    <Text color={CommonStyles.lightTextColor} fontSize={12}>
      {text.toUpperCase()}
    </Text>
  </View>
);

export default style(DiaryDayCheckpoint)({
  alignItems: "center",
  flexDirection: "row",
  marginTop: 15
});
