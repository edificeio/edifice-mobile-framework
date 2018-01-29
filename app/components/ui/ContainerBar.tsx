import style from "glamorous-native"
import * as React from "react"
import { layoutSize } from "../../constants/layoutSize"
import { CommonStyles } from "../styles/common/styles"

export const ContainerBar = style.view({
	alignItems: "flex-start",
	backgroundColor: CommonStyles.mainColorTheme,
	elevation: 5,
	flexDirection: "row",
	justifyContent: "space-around",
	paddingTop: layoutSize.LAYOUT_0,
	shadowColor: CommonStyles.shadowColor,
	shadowOffset: CommonStyles.shadowOffset,
	shadowOpacity: CommonStyles.shadowOpacity,
	shadowRadius: CommonStyles.shadowRadius,
	height: layoutSize.LAYOUT_51,
})

export const ContainerTopBar = style.view({
	alignItems: "flex-start",
	backgroundColor: CommonStyles.mainColorTheme,
	elevation: 5,
	flexDirection: "row",
	height: layoutSize.LAYOUT_51,
	justifyContent: "space-around",
	paddingTop: layoutSize.LAYOUT_0,
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

export const LeftPanel = style.touchableOpacity({
	alignItems: "flex-start",
	height: layoutSize.LAYOUT_48,
	justifyContent: "flex-start",
	paddingHorizontal: layoutSize.LAYOUT_20,
	paddingVertical: layoutSize.LAYOUT_14,
	width: layoutSize.LAYOUT_60,
})

export const RightPanel = style.touchableOpacity({
	alignItems: "flex-end",
	height: layoutSize.LAYOUT_48,
	justifyContent: "flex-start",
	paddingHorizontal: layoutSize.LAYOUT_20,
	paddingVertical: layoutSize.LAYOUT_14,
	width: layoutSize.LAYOUT_60,
})

export const CenterPanel = style.touchableOpacity({
	alignItems: "center",
	flex: 1,
	justifyContent: "center",
	paddingTop: layoutSize.LAYOUT_2,
})
