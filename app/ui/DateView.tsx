import style from "glamorous-native"
import * as React from "react";
import { getTimeToShortStr, getTimeToStr, sameDay } from "../utils/date"
import { CommonStyles } from "../styles/common/styles"

const ViewDate = style.view({
	height: 16,
	alignItems: "center",
	marginBottom: 4,
})

const Text = style.text(
	{
		fontSize: 12,
	},
	({ nb = 0 }) => ({
		fontFamily: nb > 0 ? CommonStyles.primaryFontFamilySemibold : CommonStyles.primaryFontFamily,
	})
)

export const DateView = ({ date, nb = 0, short = true }) => {
	let strDate = short ? getTimeToShortStr(date) : getTimeToStr(date)

	return (
		<ViewDate>
			<Text nb={nb}>{strDate}</Text>
		</ViewDate>
	)
}
