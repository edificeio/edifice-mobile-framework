import style from "glamorous-native";
import * as React from "react";
import { CommonStyles } from "../styles/common/styles";
import { getTimeToShortStr, getTimeToStr, sameDay } from "../utils/date";
import { Paragraph } from "./Typography";

const ViewDate = style.view({
  alignItems: "center",
  height: 16,
  marginBottom: 4
});

// FIXME: Use moment.js instead of this
export const DateView = ({ date, strong = false, short = true }) => {
  const strDate = short ? getTimeToShortStr(date) : getTimeToStr(date);

  return (
    <ViewDate>
      <Paragraph
        strong={strong}
        style={{
          color: strong ? CommonStyles.textColor : CommonStyles.lightTextColor
        }}
      >
        {strDate}
      </Paragraph>
    </ViewDate>
  );
};
