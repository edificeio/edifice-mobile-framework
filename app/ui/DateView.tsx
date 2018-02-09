import style from "glamorous-native"
import * as React from "react"
import { layoutSize } from "../constants/layoutSize"
import { getMnHoursDayMonthFromTime, sameDay } from "../utils/date"
import { CommonStyles } from "../styles/common/styles"

const ViewDate = style.view({
	height: layoutSize.LAYOUT_16,
	alignItems: "center",
	marginBottom: layoutSize.LAYOUT_4,
})

const Text = style.text(
	{
		fontSize: layoutSize.LAYOUT_12,
	},
	({ nb = 0 }) => ({
		fontFamily: nb > 0 ? CommonStyles.primaryFontFamilySemibold : CommonStyles.primaryFontFamily,
	})
)

export const DateView = ({ date, nb = 0 }) => {
	let strDate = getMnHoursDayMonthFromTime(date)

	return (
		<ViewDate>
			<Text nb={nb}>{strDate}</Text>
		</ViewDate>
	)
}
