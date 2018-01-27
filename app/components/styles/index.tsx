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
		alignItems: "flex-start",
		justifyContent: "center",
	},
	buttonPanel: {
		marginTop: layoutSize.LAYOUT_7,
	},
	buttonStyle: {
		alignSelf: "center",
		backgroundColor: "transparent",
		color: CommonStyles.actionColor,
		fontWeight: "400",
		paddingHorizontal: layoutSize.LAYOUT_15,
	},
	containerErrorText: {
		alignSelf: "center",
		color: CommonStyles.errorColor,
		fontWeight: "400",
	},
	containerInfo: {
		backgroundColor: "#fcfcfccc",
		flexWrap: "wrap",
		minHeight: layoutSize.LAYOUT_15,
		padding: layoutSize.LAYOUT_4,
	},
	containerInfoText: {
		alignSelf: "center",
		color: "green",
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
		backgroundColor: "white",
		borderBottomColor: "#ddd",
		borderBottomWidth: 1,
		flexDirection: "row",
		paddingHorizontal: layoutSize.LAYOUT_16,
		paddingVertical: layoutSize.LAYOUT_12,
	},
	line: {
		alignItems: "center",
		justifyContent: "center",
	},
	link: {
		marginTop: layoutSize.LAYOUT_10,
		textDecorationLine: "underline",
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
		fontFamily: CommonStyles.primaryFontFamily,
		fontSize: layoutSize.LAYOUT_14,
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
		backgroundColor: "#eee",
		flex: 1,
		width: "100%",
	},
})

export default styles
