/**
 * HomeworkDayCheckpoint
 *
 * Just a wrapper for the heading of a day tasks. Displays a day number in a circle and a day name
 * Props:
 *     style - Glamorous style to add.
 * 	   nb - Day number to be displayed in a `HomeworkDayCircleNumber`.
 *     text - Day name to be displayed.
 *     active - An active `HomeworkDayCheckpoint` will be highlighted. Default `false`.
 */

import style from "glamorous-native";
import * as React from "react";
const { View } = style;
import { Text, TextColor } from "../../ui/text";

import HomeworkCircleNumber from "./HomeworkCircleNumber";

export interface IHomeworkDayCheckpointProps {
  style?: any;
  nb?: number;
  text?: string;
  active?: boolean;
}

const homeworkDayCheckpointStyle = {
  alignItems: "center",
  flexDirection: "row",
  marginTop: 15
};

export const HomeworkDayCheckpoint = ({
  style,
  nb,
  text = "",
  active = false
}: IHomeworkDayCheckpointProps) => (
  <View style={[homeworkDayCheckpointStyle, style]}>
    <HomeworkCircleNumber nb={nb} active={active} />
    <Text color={TextColor.Light} fontSize={12}>
      {text.toUpperCase()}
    </Text>
  </View>
);

export default HomeworkDayCheckpoint;
