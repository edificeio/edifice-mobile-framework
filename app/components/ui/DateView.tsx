import style from "glamorous-native"
import * as React from "react"
import { layoutSize } from "../../constants/layoutSize"
import { getDayMonthFromTime } from "../../utils/date"
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
	({ nb }) => ({
		fontFamily: nb > 0 ? CommonStyles.primaryFontFamilySemibold : CommonStyles.primaryFontFamily,
	})
)

export const DateView = ({ date, nb }) => {
	const pastHours = Math.round((Date.now() - date) / (3600 * 1000))
	const strDate = pastHours < 100 ? `${pastHours} h` : getDayMonthFromTime(date)

	return (
		<ViewDate>
			<Text nb={nb}>{strDate}</Text>
		</ViewDate>
	)
}
