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
		flex: collapse ? 0 : 1,
		height: collapse ? layoutSize.LAYOUT_58 : null,
	})
)
