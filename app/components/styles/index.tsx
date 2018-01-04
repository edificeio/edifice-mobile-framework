import { Dimensions, Platform, StyleSheet } from "react-native"
import { layoutSize } from "../../constants/layoutSize"
import {CommonStyles} from "./common/styles";

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
    cardDescription: {
        color: CommonStyles.cardTitle,
        marginTop: layoutSize.LAYOUT_4,
        fontSize: layoutSize.LAYOUT_8,
        marginBottom: layoutSize.LAYOUT_4,
    },
    cardTitle: {
        color: CommonStyles.cardTitle,
        fontSize: layoutSize.LAYOUT_9,
        fontWeight: "600",
        paddingTop: layoutSize.LAYOUT_3,
        paddingBottom: layoutSize.LAYOUT_3,
        textAlign: "left",
    },
    containerErrorText: {
        alignSelf: "center",
        fontWeight: "400",
        color: CommonStyles.errorColor,
    },
    containerInfo: {
        backgroundColor: saturate("#fcfcfc", 0.9),
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
        justifyContent: "center",
        flex: 1,
        paddingHorizontal: layoutSize.LAYOUT_28,
    },
    grid: {
        backgroundColor: CommonStyles.backgroundColor,
    },
	identifier: {
		alignItems: "flex-end",
		justifyContent: "center",
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
    item: {
        padding: 10,
		backgroundColor: CommonStyles.backgroundColor,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        flexDirection: "row",
    },
	statusText: {
		color: CommonStyles.fadColor,
		fontSize: layoutSize.LAYOUT_7,
		fontWeight: "300",
	},
    logo: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        margin: layoutSize.LAYOUT_12,
    },
    text: {
        color: CommonStyles.textColor,
        fontSize: layoutSize.LAYOUT_10,
    },
    minitext: {
        color: CommonStyles.miniTextColor,
        textDecorationLine: "underline",
    },
    textBoldOverride: {
        fontWeight: "bold",
    },
})

export default styles

function saturate(color, percent) {
	let R = parseInt(color.substring(1, 3), 16)
	let G = parseInt(color.substring(3, 5), 16)
	let B = parseInt(color.substring(5, 7), 16)
	R = parseInt(R * percent)
	G = parseInt(G * percent)
	B = parseInt(B * percent)
	R = R < 255 ? R : 255
	G = G < 255 ? G : 255
	B = B < 255 ? B : 255
	const r = R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16)
	const g = G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16)
	const b = B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16)
	return `#${r + g + b}`
}
