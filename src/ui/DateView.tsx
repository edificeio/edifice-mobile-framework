import style from "glamorous-native";
import * as React from "react";
import {CommonStyles} from "../styles/common/styles";
import {getTimeToShortStr, getTimeToStr, sameDay} from "../utils/date";
import {Paragraph} from "./Typography";
import {layoutSize} from "../styles/common/layoutSize";
import {ViewStyle} from "react-native";

const ViewDate = style.view({
        alignItems: "center",
        height: 16
    },
    ({min}): ViewStyle => ({
        marginBottom: min ? 0 : 4,
    })
)

// FIXME: Use moment.js instead of this
export const DateView = ({date = 0, min = false, strong = false, short = true}) => {
    const strDate = short ? getTimeToShortStr(date) : getTimeToStr(date);

    return (
        <ViewDate min={min}>
            <Paragraph
                strong={strong}
                style={{
                    fontSize: min ? layoutSize.LAYOUT_10 : undefined,
                    color: strong ? CommonStyles.textColor : CommonStyles.lightTextColor,
                }}
            >
                {strDate}
            </Paragraph>
        </ViewDate>
    );
};
