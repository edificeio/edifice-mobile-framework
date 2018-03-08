import style from "glamorous-native";
import { CommonStyles } from "../styles/common/styles"

export const ArticleContainer = style.view({
	paddingTop: 5,
	paddingBottom: 5,
	flex: 1,
	flexDirection: 'column',
	flexWrap: 'wrap'
});

export const ArticlePage = style.scrollView({
	paddingTop: 5,
	paddingBottom: 5,
	flex: 1,
	flexDirection: 'column',
	flexWrap: 'wrap',
	backgroundColor: "rgb(248,248,250)"
});

export const ListItem = style.touchableOpacity(
	{
		backgroundColor: '#FFFFFF',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomColor: CommonStyles.borderBottomItem,
		flexDirection: 'row'
	},
	({ borderBottomWidth = 1, full = false, nb = 0 }) => ({
		borderLeftWidth: full ? 4 : 0,
		borderLeftColor: full ? CommonStyles.hightlightColor : "transparent",
		backgroundColor: nb > 0 ? CommonStyles.nonLue : '#FFFFFF',
		borderBottomWidth,
	})
)

export const Header = style.view({
	alignItems: "flex-start",
	flexDirection: "row",
	justifyContent: "flex-start",
	height: 62,
	width: '100%'
})

export const LeftPanel = style.view({
	height: 50,
	width: 50,
})

export const CenterPanel = style.view({
	alignItems: "flex-start",
	flex: 1,
	justifyContent: "center",
	marginHorizontal: 6,
	padding: 2,
})

export const RightPanel = style.view({
	alignItems: "center",
	height: 50,
	justifyContent: "flex-end",
	width: 50,
})

export const Content = style.text(
	{
		color: CommonStyles.iconColorOff,
		fontFamily: CommonStyles.primaryFontFamilyLight,
		fontSize: 12,
		marginTop: 10,
	},
	({ nb = 0 }) => ({
		color: nb > 0 ? CommonStyles.textColor : CommonStyles.iconColorOff,
		fontFamily: nb > 0 ? CommonStyles.primaryFontFamily : CommonStyles.primaryFontFamilyLight,
	})
)

export const PageContainer = style.view({
	backgroundColor: CommonStyles.lightGrey,
	flex: 1
});