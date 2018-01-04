import { StyleSheet } from "react-native"
import {layoutSize} from "../constants/layoutSize";

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
