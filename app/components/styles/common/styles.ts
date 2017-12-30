import {Text} from "react-native";

Text.defaultProps.style = { fontFamily: 'OpenSans' }

export const CommonStyles = {
	mainColorTheme: "#0096ca",
    tabBottomColor: "#ffffff",
	textTabBottomColor: "#000000",
	backgroundColor: "#ffffff",
	secondaryBackGroundColor: "#f9fafb",
	fontColor: "#8f8f8f",
	secondaryFontColor: "#8e8e93",
	primaryFontFamily: "OpenSans",
	primaryTitleColor: "#007396", //blue-ish theme
	primaryButtonColor: "#007396", //blue-ish theme
	primaryBorderColor: "#bcbbc1", // some grey-ish delight with a touch of lavender. Amazing.
	secondaryButtonColor: "#fc624d", //red-ish theme
	inputBackColor: "#ffffff",
	textInputColor: "#222222",
	errorColor: "red",
	borderColor: "#cccccc",
	shadowColor: "rgba(0, 0, 0, 1.0)",
	shadowOffset: {
		width: 0,
		height: 1,
	},
	shadowRadius: 1.5,
	shadowOpacity: 0.25,
	elevation: 0.5,
}
