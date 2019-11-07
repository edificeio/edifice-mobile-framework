import { Text } from "react-native";
import { setCustomText } from "react-native-global-props";

export const CommonStyles = {
  primary: "#299cc8",
  primaryLight: "#EAF5F9",
  lightGrey: "rgb(248,248,250)",
  missingGrey: "rgb(218,218,210)",
  grey: "rgb(188,188,190)",
  lightTextColor: "#858FA9",
  actionColor: "#2A9CC8",
  // actionColorDisabled: "#2A9CC888",
  borderBottomItem: "#dddddd",
  // borderBottomNewsItem: "#e7e7e7",
  borderColorLighter: "#e2e2e2",
  // cardTitle: "#1467ff",
  elevation: 20,
  entryfieldBorder: "#DCDDE0",
  errorColor: "#EC5D61",
  fadColor: "#444444",
  hightlightColor: "#FFFF00", // remove this
  iconColorOff: "#858FA9",
  iconColorOn: "#2A9CC8",
  inputBackColor: "#F8F8FA",
  inverseColor: "#F8F8FA",
  // linkColor: "#2a97f5",
  mainColorTheme: "#2A9CC8",
  miniTextColor: "#858FA9",
  nonLue: "#2A9CC81A",
  placeholderColor: "#B2BECDDD",
  // primaryBorderColor: "#bcbbc1",
  // primaryButtonColor: "#007396",
  primaryFontFamily: "OpenSans-Regular",
  secondaryFontFamily: "roboto",
  // primaryFontFamilyBold: "OpenSans-Bold",
  // primaryFontFamilyLight: "OpenSans-Light",
  // primaryFontFamilySemibold: "OpenSans-SemiBold",
  // primaryTitleColor: "#007396",
  // secondaryBackGroundColor: "#f9fafb",
  // secondaryButtonColor: "#fc624d",
  // secondaryFontColor: "#8e8e93",
  // selectColor: "#ffff00",
  // selectColor2: "#ffff00aa",
  shadowColor: "rgba(0, 0, 0, 1.0)",
  shadowOffset: {
    height: 2,
    width: 0
  },
  shadowOpacity: 0.25,
  shadowRadius: 2,
  statusBarColor: "#0088B6",
  // tabBackgroundColor: "#2a97f5",
  tabBottomColor: "#ffffff",
  textColor: "#414355",
  textInputColor: "#414355",
  textTabBottomColor: "#858FA9",
  // titleColor: "#1467ff",
  warning: "#FFB000",
  success: "#19CA72",
  error: "#E04B35",
  white: "#fff",
  profileTypes: {
    Student: "#ff8500",
    Relative: "#4bafd5",
    Personnel: "#763294",
    Teacher: "#46bfaf",
    Guest: "#ff61c0"
  }
};

setCustomText({ style: { fontFamily: CommonStyles.primaryFontFamily } });

// Text.defaultProps.style = { fontFamily: CommonStyles.primaryFontFamily }; // Obsolete from RN 0.57
