import style from "glamorous-native"
import * as React from "react"
import { layoutSize } from "../../constants/layoutSize"
import { CommonStyles } from "../styles/common/styles"

export const ContainerBar = style.view(
	{
		alignItems: "flex-start",
		backgroundColor: CommonStyles.mainColorTheme,
		elevation: 5,
		flexDirection: "row",
		justifyContent: "space-around",
		paddingHorizontal: layoutSize.LAYOUT_20,
		shadowColor: CommonStyles.shadowColor,
		shadowOffset: CommonStyles.shadowOffset,
		shadowOpacity: CommonStyles.shadowOpacity,
		shadowRadius: CommonStyles.shadowRadius,
	},
	({ collapse }) => ({
		height: collapse ? layoutSize.LAYOUT_51 : layoutSize.LAYOUT_200,
		paddingTop: collapse ? layoutSize.LAYOUT_0 : layoutSize.LAYOUT_20,
	})
)

export const LeftPanel = style.view({
	alignItems: "flex-start",
	justifyContent: "flex-start",
	paddingTop: layoutSize.LAYOUT_14,
	width: layoutSize.LAYOUT_40,
})

export const RightPanel = style.view({
	alignItems: "flex-end",
	justifyContent: "flex-start",
	paddingTop: layoutSize.LAYOUT_14,
	width: layoutSize.LAYOUT_40,
})
