/**
 * DiaryCard
 *
 * Like `Card`, but some margin and padding, custom shadow and rounded.
 */

import style from "glamorous-native";
import * as React from "react";
const { Text, TouchableOpacity } = style;
import HTMLAdaptor from "../../infra/HTMLAdaptor";
import { CommonStyles } from "../../styles/common/styles";

const DiaryCard = ({
  style,
  title,
  content,
  onPress
}: {
  style?: any;
  title?: string;
  content?: string;
  onPress?: any; // custom event
}) => (
  <TouchableOpacity
    style={[style]}
    onPress={() => {
      onPress();
    }}
  >
    <Text fontSize={14} color={CommonStyles.textColor} lineHeight={20}>
      {HTMLAdaptor(content).extractTextBeginning()}
    </Text>
    <Text fontSize={12} color={CommonStyles.lightTextColor} marginTop={5}>
      {title}
    </Text>
  </TouchableOpacity>
);

export default style(DiaryCard)({
  backgroundColor: "#FFF",
  borderRadius: 5,
  elevation: 1,
  marginBottom: 15,
  marginLeft: 60,
  marginRight: 20,
  paddingHorizontal: 15,
  paddingVertical: 20,
  shadowColor: "#6B7C93",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2
});
