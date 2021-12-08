/**
 * HomeworkDayCircleNumber
 *
 * Display a number in a circle elegantly. Mostly used to show a day number.
 * Props:
 *     `style` - Glamorous style to add.
 * 	   `nb` - Just as simple as the number to be displayed.
 *     `active` - An active `HomeworkDayCircleNumber` will be highlighted. Default false.
 * TODO: When active, the blue background should be a gradient, according to the mockup.
 */

import style from "glamorous-native";
import * as React from "react";
const { View } = style;
import { CommonStyles } from "../../styles/common/styles";
import { Text } from "../../framework/components/text";
import theme from "../../app/theme";

export interface IHomeworkCircleNumberProps {
  style?: any;
  nb?: number;
  active?: boolean;
}

const homeworkCircleNumberStyle = {
  alignItems: "center",
  borderColor: CommonStyles.tabBottomColor,
  borderRadius: 15,
  borderStyle: "solid",
  borderWidth: 1,
  elevation: 3,
  height: 30,
  justifyContent: "center",
  marginHorizontal: 14,
  shadowColor: "#6B7C93",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  width: 30
};

export const HomeworkCircleNumber = ({
  style,
  nb,
  active = false
}: IHomeworkCircleNumberProps) => {
  const backgroundStyle = {
    backgroundColor: active
      ? CommonStyles.actionColor
      : CommonStyles.tabBottomColor
  };

  return (
    <View style={[homeworkCircleNumberStyle, backgroundStyle, style]}>
      <Text color={active ? theme.color.text.inverse : theme.color.text.light} fontSize={12}>
        {nb}
      </Text>
    </View>
  );
};

export default HomeworkCircleNumber;
