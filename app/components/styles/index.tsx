import { Dimensions, Platform, StyleSheet } from "react-native"
import { layoutSize } from "../../constants/layoutSize"
import {CommonStyles} from "./common/styles";

export const deviceWidth = Dimensions.get("window").width

const widthDuration = deviceWidth - layoutSize.LAYOUT_4 - layoutSize.LAYOUT_20
const widthCalendar = Math.round((widthDuration - layoutSize.LAYOUT_4) * 2 / 3)

export const actionColor = "#0096CA"
export const actionColorDisabled = "#0096CA99"
export const backgroundColor = "transparent"
export const borderColor = "#cccccc"
export const errorColor = "#ff0000"
export const fadColor = "#444444"
export const inputBackColor = "#ffffff"
export const inverseColor = "#ffffff"
export const navigationColor = "#2a97f5"
export const placeholderColor = "#88888899"
export const selectColor = "#ffff00"
export const textColor = "#222222"
export const titleColor = "#1467ff"

export const buttonColor = inputBackColor
export const cardTitle = titleColor
export const color = textColor
export const linkColor = navigationColor
export const tabBackgroundColor = navigationColor
export const textInputColor = textColor
export const title = titleColor
export const validActionColor = actionColor
export const validActionColorDisabled = actionColorDisabled

const styles = StyleSheet.create({
	Disable: {
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		backgroundColor: "transparent",
	},
	authTitle: {
		color: "#333333",
		fontSize: layoutSize.LAYOUT_18,
		paddingTop: layoutSize.LAYOUT_8,
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
		color: actionColor,
		backgroundColor: "transparent",
		fontSize: layoutSize.LAYOUT_10,
		padding: layoutSize.LAYOUT_3,
		fontWeight: "400",
	},
	calendar: {
		width: widthCalendar,
	},
    cardDescription: {
        color,
        marginTop: layoutSize.LAYOUT_4,
        fontSize: layoutSize.LAYOUT_8,
        marginBottom: layoutSize.LAYOUT_4,
    },
    cardTitle: {
        color: cardTitle,
        fontSize: layoutSize.LAYOUT_9,
        fontWeight: "600",
        paddingTop: layoutSize.LAYOUT_3,
        paddingBottom: layoutSize.LAYOUT_3,
        textAlign: "left",
    },
    containerErrorText: {
        alignSelf: "center",
        fontWeight: "400",
        color: errorColor,
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
	inputError: {
		color: "red",
		fontSize: layoutSize.LAYOUT_8,
		fontWeight: "800",
		marginBottom: layoutSize.LAYOUT_5,
	},
    line: {
        alignItems: "center",
        justifyContent: "center",
    },
	link: {
		textDecorationLine: "underline",
		marginTop: layoutSize.LAYOUT_10,
	},
	linkColor: {
		color: linkColor,
		fontWeight: "600",
		marginTop: layoutSize.LAYOUT_10,
		textDecorationLine: "underline",
	},
	linkMargin: {
		marginTop: layoutSize.LAYOUT_10,
	},
	linkMarginLeft: {
		textDecorationLine: "underline",
		marginLeft: layoutSize.LAYOUT_10,
		color: "#333333",
	},
    linksPanel: {
        marginTop: layoutSize.LAYOUT_9,
    },
	loading: {
		backgroundColor: "#ff5000",
		height: layoutSize.LAYOUT_3,
	},
	marginCenterForm: {
		marginTop: layoutSize.LAYOUT_5,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "transparent",
	},
	marginTop: {
		marginTop: layoutSize.LAYOUT_8,
	},
    item: {
        padding: 10,
        backgroundColor,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        flexDirection: "row",
    },
	statusText: {
		color: fadColor,
		fontSize: layoutSize.LAYOUT_7,
		fontWeight: "300",
	},
	textInput: {
		color: textInputColor,
		fontSize: layoutSize.LAYOUT_10,
		height: layoutSize.LAYOUT_36,
	},
	textInputErrorWrapper: {
		backgroundColor: inputBackColor,
		borderColor: errorColor,
		borderRadius: 3,
		borderWidth: 1,
        paddingBottom: 0,
	},
	textInputMulti: {
		color: textInputColor,
		fontSize: layoutSize.LAYOUT_10,
		height: layoutSize.LAYOUT_60,
	},
	textInputWrapper: {
		backgroundColor: inputBackColor,
		borderBottomColor: borderColor,
		borderBottomWidth: 1,
		paddingBottom: 0,
	},
    logo: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        margin: layoutSize.LAYOUT_12,
    },
    text: {
        color: CommonStyles.fontColor,
        fontSize: layoutSize.LAYOUT_10,
    },
    minitext: {
        color: CommonStyles.fontColor,
        fontSize: layoutSize.LAYOUT_10,
        textDecorationLine: "underline",
    },
    textBoldOverride: {
        fontWeight: "bold",
    },
	validButtonStyle: {
		alignSelf: "center",
		backgroundColor: validActionColor,
		color: inverseColor,
		fontSize: layoutSize.LAYOUT_10,
		paddingLeft: layoutSize.LAYOUT_24,
		paddingRight: layoutSize.LAYOUT_24,
		paddingTop: layoutSize.LAYOUT_5,
		paddingBottom: layoutSize.LAYOUT_5,
		borderRadius: layoutSize.LAYOUT_20,
		fontWeight: "500",
	},
	validButtonStyleDisabled: {
		alignSelf: "center",
		backgroundColor: "transparent",
		color: validActionColor,
		fontSize: layoutSize.LAYOUT_10,
		paddingLeft: layoutSize.LAYOUT_24,
		paddingRight: layoutSize.LAYOUT_24,
		paddingTop: layoutSize.LAYOUT_5,
		paddingBottom: layoutSize.LAYOUT_5,
		borderRadius: layoutSize.LAYOUT_20,
		borderColor: validActionColorDisabled,
		borderWidth: 1,
		fontWeight: "400",
	},
	validButtonStyleWrapper: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor,
		marginTop: layoutSize.LAYOUT_26,
		marginBottom: layoutSize.LAYOUT_13,
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
