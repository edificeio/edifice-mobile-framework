import { Dimensions, StyleSheet } from "react-native";
import { CommonStyles } from './common/styles';

export const deviceWidth = Dimensions.get("window").width

const styles = StyleSheet.create({
	Disable: {
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		bottom: 0
	},
	avatar: {
		alignItems: "flex-start",
		justifyContent: "center",
	},
	buttonPanel: {
		marginTop: 7,
	},
	buttonStyle: {
		alignSelf: "center",
		backgroundColor: "transparent",
		color: CommonStyles.actionColor,
		fontWeight: "400",
		paddingHorizontal: 15,
	},
	containerErrorText: {
		alignSelf: "center",
		color: CommonStyles.errorColor,
		fontWeight: "400",
	},
	containerInfo: {
		backgroundColor: "#fcfcfccc",
		flexWrap: "wrap",
		minHeight: 15,
		padding: 4,
	},
	containerInfoText: {
		alignSelf: "center",
		color: "green",
	},
	formGrid: {
		backgroundColor: CommonStyles.lightGrey,
		flex: 1,
		paddingHorizontal: 34,
	},
	grid: {
		backgroundColor: CommonStyles.lightGrey,
	},
	gridWhite: {
		backgroundColor: CommonStyles.lightGrey,
	},
	identifier: {
		alignItems: "flex-end",
		justifyContent: "center",
	},
	item: {
		backgroundColor: "white",
		borderBottomColor: "#ddd",
		borderBottomWidth: 1,
		flexDirection: "column",
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	line: {
		alignItems: "center",
		justifyContent: "center",
	},
	link: {
		marginTop: 10,
		textDecorationLine: "underline",
	},
	loading: {
		backgroundColor: "#ff5000",
		height: 3,
	},
	marginTop: {
		marginTop: 8,
	},
	minitext: {
		color: CommonStyles.miniTextColor,
		fontFamily: CommonStyles.primaryFontFamily,
		fontSize: 14,
		textDecorationLine: "underline",
	},
	statusText: {
		color: CommonStyles.fadColor,
		fontSize: 7,
		fontWeight: "300",
	},
	text: {
		color: CommonStyles.textInputColor,
		fontFamily: CommonStyles.primaryFontFamily,
		fontSize: 14,
	},
	webview: {
		backgroundColor: "#eee",
		flex: 1,
		width: "100%",
	},
})

export default styles
