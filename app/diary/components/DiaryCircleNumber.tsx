/**
 * DiaryDayCircleNumber
 *
 * Display a number in a circle elegantly. Mostly used to show a day number.
 * Props:
 *     `style`: `any` - Glamorous style to add.
 * 	   `nb`: `number` - Just as simple as the number to be displayed.
 *     `active`: `boolean` - An active `DiaryDayCircleNumber` will be highlighted.
 * TODO: When active, the blue background should be a gradient, according to the mockup.
 *
 * An unstyled version on this component is available as `DiaryDayCircleNumber_Unstyled`.
 */

import style from "glamorous-native";
import * as React from "react";
const { Text, View } = style;
import { CommonStyles } from "../../styles/common/styles";

// tslint:disable-next-line:variable-name
const DiaryCircleNumber = ({
  style,
  nb,
  active = false
}: {
  style?: any;
  nb?: number;
  active?: boolean;
}) => (
  <View style={[style]}>
    <Text
      color={active ? CommonStyles.tabBottomColor : CommonStyles.lightTextColor}
      fontSize={12}
    >
      {nb}
    </Text>
  </View>
);

export default style(DiaryCircleNumber)(
  {
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
  },
  ({ active }) => ({
    backgroundColor: active
      ? CommonStyles.actionColor
      : CommonStyles.tabBottomColor
  })
);
