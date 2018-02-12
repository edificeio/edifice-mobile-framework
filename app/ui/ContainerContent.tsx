import style from "glamorous-native"
import { layoutSize } from "../constants/layoutSize"
import { CommonStyles } from "../styles/common/styles"

export const Item = style.touchableOpacity(
	{
		backgroundColor: CommonStyles.itemBackgroundColor,
		paddingHorizontal: layoutSize.LAYOUT_16,
		paddingVertical: layoutSize.LAYOUT_12,
		borderBottomColor: CommonStyles.borderBottomItem,
		borderBottomWidth: 1,
	},
	({ full = false, nb = 0 }) => ({
		borderLeftWidth: full ? layoutSize.LAYOUT_4 : 0,
		borderLeftColor: full ? CommonStyles.selectColor2 : "transparent",
		backgroundColor: nb > 0 ? CommonStyles.nonLue : CommonStyles.itemBackgroundColor,
	})
)

export const Header = style.view({
	flexDirection: "row",
})

export const LeftPanel = style.view({
	alignItems: "center",
	justifyContent: "flex-start",
	width: layoutSize.LAYOUT_50,
})

export const CenterPanel = style.view({
	alignItems: "flex-start",
	flex: 1,
	justifyContent: "center",
	marginHorizontal: layoutSize.LAYOUT_6,
	padding: layoutSize.LAYOUT_2,
})

export const RightPanel = style.view({
	alignItems: "center",
	justifyContent: "flex-end",
	width: layoutSize.LAYOUT_50,
})

export const Content = style.text(
	{
		color: CommonStyles.iconColorOff,
		fontFamily: CommonStyles.primaryFontFamilyLight,
		fontSize: layoutSize.LAYOUT_12,
		marginTop: layoutSize.LAYOUT_10,
	},
	({ nb = 0 }) => ({
		color: nb > 0 ? CommonStyles.textColor : CommonStyles.iconColorOff,
		fontFamily: nb > 0 ? CommonStyles.primaryFontFamily : CommonStyles.primaryFontFamilyLight,
	})
)
