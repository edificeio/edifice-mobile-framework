/**
 * DiaryCard
 *
 * Like `Card`, but some margin and padding, custom shadow and rounded.
 */

import style from "glamorous-native";
import * as React from "react";
const { Text, TouchableOpacity } = style;
import HtmlToText from "../../infra/htmlConverter/text";
import { CommonStyles } from "../../styles/common/styles";
import { Tracking } from "../../tracking/TrackingManager"

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
}) => {
  return (
    <TouchableOpacity
      style={{
        ...style,
        backgroundColor: "#FFF",
        borderRadius: 5,
        elevation: 1,
        marginLeft: 60,
        marginRight: 20,
        marginTop: 15,
        paddingHorizontal: 15,
        paddingVertical: 20,
        shadowColor: "#6B7C93",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2
      }}
      onPress={() => {
        onPress();
        Tracking.logEvent('ReadHomework');
      }}
    >
      <Text fontSize={14} color={CommonStyles.textColor} lineHeight={20}>
        {HtmlToText(content, true).excerpt}
      </Text>
      <Text fontSize={12} color={CommonStyles.lightTextColor} marginTop={5}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default DiaryCard;
