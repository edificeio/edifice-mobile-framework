import style from "glamorous-native"
import * as React from "react";
import { getTimeToShortStr, getTimeToStr, sameDay } from "../utils/date"
import { CommonStyles } from "../styles/common/styles"
import { Paragraph } from "./Typography";

const ViewDate = style.view({
	height: 16,
	alignItems: "center",
	marginBottom: 4,
})

const Text = style.text(
	{
		fontSize: 12,
		color: CommonStyles.textColor
	},
	({ nb = 0 }) => ({
		fontFamily: nb > 0 ? CommonStyles.primaryFontFamilySemibold : CommonStyles.primaryFontFamily,
	})
)

export const DateView = ({ date, strong = false, short = true }) => {
	let strDate = short ? getTimeToShortStr(date) : getTimeToStr(date)

	return (
		<ViewDate>
			<Paragraph strong={ strong } style={{ color: strong ? CommonStyles.textColor : CommonStyles.lightTextColor}}>{ strDate }</Paragraph>
		</ViewDate>
	)
}
