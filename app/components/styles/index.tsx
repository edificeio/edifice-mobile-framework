import { Dimensions, StyleSheet } from "react-native"
import { layoutSize } from "../../constants/layoutSize"
import { CommonStyles } from "./common/styles"

export const deviceWidth = Dimensions.get("window").width

const styles = StyleSheet.create({
	Disable: {
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		backgroundColor: "transparent",
	},
	avatar: {
		justifyContent: "center",
		alignItems: "flex-start",
	},
	buttonPanel: {
		marginTop: layoutSize.LAYOUT_7,
	},
	buttonStyle: {
		alignSelf: "center",
		color: CommonStyles.actionColor,
		backgroundColor: "transparent",
		paddingHorizontal: layoutSize.LAYOUT_15,
		fontWeight: "400",
	},
	containerErrorText: {
		alignSelf: "center",
		fontWeight: "400",
		color: CommonStyles.errorColor,
	},
	containerInfo: {
		backgroundColor: "#fcfcfccc",
		minHeight: layoutSize.LAYOUT_15,
		flexWrap: "wrap",
		padding: layoutSize.LAYOUT_4,
	},
	containerInfoText: {
		color: "green",
		alignSelf: "center",
	},
	formGrid: {
		backgroundColor: CommonStyles.backgroundColor,
		flex: 1,
		paddingHorizontal: layoutSize.LAYOUT_34,
	},
	grid: {
		backgroundColor: CommonStyles.backgroundColor,
	},
	identifier: {
		alignItems: "flex-end",
		justifyContent: "center",
	},
	item: {
		paddingHorizontal: layoutSize.LAYOUT_16,
		paddingVertical: layoutSize.LAYOUT_12,
		backgroundColor: "white",
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
		flexDirection: "row",
	},
	line: {
		alignItems: "center",
		justifyContent: "center",
	},
	link: {
		textDecorationLine: "underline",
		marginTop: layoutSize.LAYOUT_10,
	},
	loading: {
		backgroundColor: "#ff5000",
		height: layoutSize.LAYOUT_3,
	},
	marginTop: {
		marginTop: layoutSize.LAYOUT_8,
	},
	minitext: {
		color: CommonStyles.miniTextColor,
		fontSize: layoutSize.LAYOUT_14,
		fontFamily: CommonStyles.primaryFontFamily,
		textDecorationLine: "underline",
	},
	statusText: {
		color: CommonStyles.fadColor,
		fontSize: layoutSize.LAYOUT_7,
		fontWeight: "300",
	},
	text: {
		color: CommonStyles.textInputColor,
		fontFamily: CommonStyles.primaryFontFamily,
		fontSize: layoutSize.LAYOUT_14,
	},
	webview: {
		width: "100%",
		flex: 1,
		backgroundColor: "#eee",
	},
})

export default styles
