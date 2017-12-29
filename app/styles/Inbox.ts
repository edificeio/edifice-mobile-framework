import { StyleSheet } from "react-native"

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
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		width: 75,
	},
})
