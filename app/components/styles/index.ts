import { Dimensions, Platform, StyleSheet } from "react-native"
import { layoutSize } from "../../constants/layoutSize"
import {CommonStyles} from "./common/styles";

export const deviceWidth = Dimensions.get("window").width

const widthDuration = deviceWidth - layoutSize.LAYOUT_4 - layoutSize.LAYOUT_20
const widthCalendar = Math.round((widthDuration - layoutSize.LAYOUT_4) * 2 / 3)

export const actionColor = "#0096CA"
export const actionColorDisabled = "#0096CA70"
export const annulOrangeActionColor = "#ee6633"
export const appBackgroundColor = "transparent"
export const backgroundColor = "transparent"
export const backgroundColorDisabled = "#f2f2f270"
export const borderColor = "#cccccc"
export const cardGreenBackgroundColor = "#00ff0022"
export const cardGreenBorderColor = "#00ff0020"
export const cardOrangeBackgroundColor = "#ff800022"
export const cardOrangeBorderColor = "#ff800020"
export const cardRedBackgroundColor = "#ff000077"
export const cardRedBorderColor = "#ff000020"
export const colorDisabled = "#44444444"
export const errorColor = "#ff0000"
export const fadColor = "#444444"
export const inputBackColor = "#ffffff"
export const inverseColor = "#ffffff"
export const navigationColor = "#2a97f5"
export const placeholderColor = "#88888899"
export const selectColor = "#ffff00"
export const separatorColor = "#a0a0ff"
export const surName = "#225577"
export const textColor = "#222222"
export const textNavigationColor = "#ffffff"
export const titleColor = "#1467ff"
export const topicBackgroundColor = "#ffffff"

export const annulRedActionColor = errorColor
export const buttonColor = inputBackColor
export const cardBackgroundColor = backgroundColor
export const cardBackgroundColorDisabled = backgroundColorDisabled
export const cardTitle = titleColor
export const color = textColor
export const containerBackgroundColor = backgroundColor
export const linkColor = navigationColor
export const statusSystemBarColor = navigationColor
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
		fontSize: layoutSize.LAYOUT_14,
		paddingTop: layoutSize.LAYOUT_6,
	},
	avatar: {
		justifyContent: "center",
		alignItems: "flex-start",
	},
    buttonPanel: {
        marginTop: layoutSize.LAYOUT_5,
    },
	buttonStyle: {
		alignSelf: "center",
		color: inverseColor,
		backgroundColor: buttonColor,
		fontSize: layoutSize.LAYOUT_7,
		padding: layoutSize.LAYOUT_2,
		fontWeight: "600",
	},
	calendar: {
		width: widthCalendar,
	},
	dropdownStyle: {
		backgroundColor: inputBackColor,
		height: layoutSize.LAYOUT_140,
	},
    formGrid: {
        backgroundColor: CommonStyles.backgroundColor,
        justifyContent: "center",
        flex: 1,
        paddingHorizontal: layoutSize.LAYOUT_20,
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
		fontSize: layoutSize.LAYOUT_6,
		fontWeight: "800",
		marginBottom: layoutSize.LAYOUT_4,
	},
    inputsPanel: {
        paddingTop: layoutSize.LAYOUT_10,
    },
    line: {
        alignItems: "center",
        justifyContent: "center",
    },
	link: {
		textDecorationLine: "underline",
		marginTop: layoutSize.LAYOUT_8,
	},
	linkColor: {
		color: linkColor,
		fontWeight: "600",
		marginTop: layoutSize.LAYOUT_8,
		textDecorationLine: "underline",
	},
	linkMargin: {
		marginTop: layoutSize.LAYOUT_8,
	},
	linkMarginLeft: {
		textDecorationLine: "underline",
		marginLeft: layoutSize.LAYOUT_8,
		color: "#333333",
	},
    linksPanel: {
        marginTop: layoutSize.LAYOUT_7,
    },
	loading: {
		backgroundColor: "#ff5000",
		height: layoutSize.LAYOUT_2,
	},
	marginCenterForm: {
		marginTop: layoutSize.LAYOUT_4,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "transparent",
	},
	marginTop: {
		marginTop: layoutSize.LAYOUT_6,
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
		fontSize: layoutSize.LAYOUT_5,
		fontWeight: "300",
	},
	textInput: {
		color: textInputColor,
		fontSize: layoutSize.LAYOUT_8,
		marginBottom: layoutSize.LAYOUT_MOINS_2,
	},
	textInputErrorWrapper: {
		backgroundColor: inputBackColor,
		borderColor: errorColor,
		borderRadius: 3,
		borderWidth: 1,
	},
	textInputMulti: {
		color: textInputColor,
		fontSize: layoutSize.LAYOUT_8,
		height: layoutSize.LAYOUT_50,
	},
	textInputWrapper: {
		backgroundColor: inputBackColor,
		borderBottomColor: borderColor,
		borderBottomWidth: 1,
	},
    logo: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        margin: layoutSize.LAYOUT_10,
    },
    text: {
        color: CommonStyles.fontColor,
        fontSize: layoutSize.LAYOUT_8,
    },
    minitext: {
        color: CommonStyles.fontColor,
        fontSize: layoutSize.LAYOUT_8,
        textDecorationLine: "underline",
    },
    textBoldOverride: {
        fontWeight: "bold",
    },
	validButtonStyle: {
		alignSelf: "center",
		backgroundColor: validActionColor,
		color: inverseColor,
		fontSize: layoutSize.LAYOUT_8,
		paddingLeft: layoutSize.LAYOUT_18,
		paddingRight: layoutSize.LAYOUT_18,
		paddingTop: layoutSize.LAYOUT_4,
		paddingBottom: layoutSize.LAYOUT_4,
		borderRadius: layoutSize.LAYOUT_10,
		fontWeight: "500",
	},
	validButtonStyleDisabled: {
		alignSelf: "center",
		backgroundColor: "transparent",
		color: validActionColor,
		fontSize: layoutSize.LAYOUT_8,
		paddingLeft: layoutSize.LAYOUT_18,
		paddingRight: layoutSize.LAYOUT_18,
		paddingTop: layoutSize.LAYOUT_4,
		paddingBottom: layoutSize.LAYOUT_4,
		borderRadius: layoutSize.LAYOUT_10,
		borderColor: validActionColor,
		borderWidth: 1,
		fontWeight: "400",
	},
	validButtonStyleWrapper: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor,
		borderRadius: layoutSize.LAYOUT_10,
		marginTop: layoutSize.LAYOUT_20,
		marginBottom: layoutSize.LAYOUT_10,
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
