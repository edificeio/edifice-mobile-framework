import * as React from "react"
import {getDayMonthFromTime} from "../../utils/date";
import style from "glamorous-native"
import {layoutSize} from "../../constants/layoutSize";


const Text  = style.text({ fontSize:layoutSize.LAYOUT_12})

export const DateView = ({ date }) => {
    const pastHours = Math.round((Date.now() - date) / 60 * 3600 * 1000)
    const strDate = pastHours < 24 ? `${pastHours} h` : getDayMonthFromTime(date);

    return (
        <Text>{strDate}</Text>
    )
}
