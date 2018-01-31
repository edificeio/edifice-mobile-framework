import style from "glamorous-native"
import * as React from "react"
import { layoutSize } from "../../constants/layoutSize"
import { CommonStyles } from "../styles/common/styles"
import { ViewStyle } from "react-native"

const containerBar: ViewStyle = {
	alignItems: "flex-start",
	elevation: 5,
	flexDirection: "row",
	justifyContent: "flex-start",
	height: layoutSize.LAYOUT_56,
}

export const ContainerTopBar = style.view({
	...containerBar,
	backgroundColor: CommonStyles.mainColorTheme,
})

export const ContainerEndBar = style.view({
	alignItems: "center",
	backgroundColor: CommonStyles.mainColorTheme,
	elevation: 5,
	height: layoutSize.LAYOUT_160,
	justifyContent: "flex-start",
	paddingTop: layoutSize.LAYOUT_20,
	shadowColor: CommonStyles.shadowColor,
	shadowOffset: CommonStyles.shadowOffset,
	shadowOpacity: CommonStyles.shadowOpacity,
	shadowRadius: CommonStyles.shadowRadius,
})

export const ContainerFooterBar = style.view({
	...containerBar,
	backgroundColor: CommonStyles.tabBottomColor,
	borderTopColor: CommonStyles.borderColorLighter,
	borderTopWidth: 1,
	elevation: 1,
	height: layoutSize.LAYOUT_56,
})

const sensitiveStylePanel: ViewStyle = {
	alignItems: "center",
	height: layoutSize.LAYOUT_56,
	justifyContent: "center",
	paddingLeft: layoutSize.LAYOUT_20,
	paddingRight: layoutSize.LAYOUT_10,
	width: layoutSize.LAYOUT_58,
}

export const TouchableBarPanel = style.touchableOpacity(sensitiveStylePanel)

const centerPanel: ViewStyle = {
	alignItems: "center",
	flex: 1,
	height: layoutSize.LAYOUT_56,
	justifyContent: "center",
}

export const CenterPanel = style.touchableOpacity(centerPanel)

export const Text = style.text(
	{
		color: "white",
		fontFamily: CommonStyles.primaryFontFamily,
		fontWeight: "400",
	},
	({ smallSize = false }) => ({
		fontSize: smallSize ? layoutSize.LAYOUT_12 : layoutSize.LAYOUT_16,
	})
)
