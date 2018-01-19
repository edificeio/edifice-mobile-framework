import * as React from "react"
import {getDayMonthFromTime} from "../../utils/date";
import style from "glamorous-native"
import {layoutSize} from "../../constants/layoutSize";
import {CommonStyles} from "../styles/common/styles";


const Text  = style.text({
    fontSize:layoutSize.LAYOUT_12},
    ({nb}) => ({
        fontFamily: nb > 0 ? CommonStyles.primaryFontFamilySemibold : CommonStyles.primaryFontFamily
    })
)

export const DateView = ({ date, nb }) => {
    const pastHours = Math.round((Date.now() - date) / 60 * 3600 * 1000)
    const strDate = pastHours < 24 ? `${pastHours} h` : getDayMonthFromTime(date);

    return (
        <Text nb={nb}>{strDate}</Text>
    )
}
