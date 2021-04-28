import style from "glamorous-native";
import * as React from "react";
import moment from "moment";
import {CommonStyles} from "../styles/common/styles";
import {Paragraph} from "./Typography";
import {layoutSize} from "../styles/common/layoutSize";
import {ViewStyle} from "react-native";
import { displayPastDate } from "../framework/util/date";

const ViewDate = style.view({
        alignItems: "center",
        height: 20
    },
    ({min}): ViewStyle => ({
        marginBottom: min ? -2 : 4,
    })
)

export const DateView = ({date, min = false, strong = false}) => {
    return (
        <ViewDate min={min}>
            <Paragraph
                strong={strong}
                style={{
                    fontSize: min ? layoutSize.LAYOUT_10 : undefined,
                    color: strong ? CommonStyles.textColor : CommonStyles.lightTextColor,
                }}
            >
                {displayPastDate(moment(date))}
            </Paragraph>
        </ViewDate>
    );
};
