import { StyleSheet } from "react-native"
import { layoutSize } from "../constants/layoutSize"

export const InboxStyle = StyleSheet.create({
	author: {
		fontWeight: "bold",
	},
	excerpt: {
		flexDirection: "row",
	},
	newMail: {
		color: "white",
		paddingRight: 15,
	},
	hiddenButtons: {
		alignItems: "center",
		flex: 1,
		justifyContent: "center",
		width: layoutSize.LAYOUT_70,
		backgroundColor: "#EC5D61",
	},
})
