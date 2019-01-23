/**
 * HomeworkCard
 *
 * Like `Card`, but some margin and padding, custom shadow and rounded.
 *
 * Props :
 *    - `style`
 *    - `title` : light text displayed at the bottom of the card
 *    - `content` : black text displayed at the top of the card
 *    - `onPress` : fires when the user touch the card
 */

import style from "glamorous-native";
import * as React from "react";
const { Text } = style;
import HtmlToText from "../../infra/htmlConverter/text";
import { CommonStyles } from "../../styles/common/styles";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";

export interface IHomeworkCardProps {
  style?: any;
  title?: string;
  content?: string;
  onPress?: () => void;
}

const homeworkCardStyle = {
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
};

export const HomeworkCard = ({
  style,
  title,
  content,
  onPress
}: IHomeworkCardProps) => {
  const formattedContent = HtmlToText(content, false).excerpt;
  return (
    <TouchableOpacity style={[homeworkCardStyle, style]} onPress={onPress}>
      {formattedContent ? (
        <Text fontSize={14} color={CommonStyles.textColor} lineHeight={20}>
          {/* TODO typo */}
          {formattedContent}
        </Text>
      ) : null}
      {title ? (
        <Text
          fontSize={12}
          color={CommonStyles.lightTextColor}
          marginTop={formattedContent ? 5 : 0}
        >
          {/* TODO typo */}
          {title}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

export default HomeworkCard;
