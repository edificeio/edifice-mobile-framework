import { CommonStyles } from "../../styles/common/styles";
import deviceInfoModule from "react-native-device-info";

/**
 * Options for a header with centered title
 */
export const standardNavScreenOptions = (props, { state }) => {
    const { params = {} } = state;
    const { header } = params;

    return {
        header,
        headerTintColor: "white",
        tabBarVisible: header !== null,
        headerBackTitle: null,
        ...props,
        headerStyle: {
            backgroundColor: CommonStyles.mainColorTheme,
            elevation: 5,
            shadowOpacity: 0.3,
            shadowRadius: 4,
            height: deviceInfoModule.hasNotch() ? 100 : 56,
            ...(props.headerStyle || {})
        },
        headerTitleStyle: {
            alignSelf: "center",
            color: "white",
            fontFamily: CommonStyles.primaryFontFamily,
            fontSize: 16,
            fontWeight: "400",
            textAlign: "center",
            ...(props.headerTitleStyle || {})
        },
        headerTitleContainerStyle: {
        left: 0
      },
    };
};

/**
 * Options for a header with left-aligned title
 */
export const alternativeNavScreenOptions = (props, navigation) =>
    standardNavScreenOptions({
        headerTitleStyle: {
            alignSelf: "center",
            color: "white",
            fontFamily: CommonStyles.primaryFontFamily,
            fontSize: 16,
            fontWeight: "400",
            textAlign: "left",
            marginHorizontal: 0
        },
        ...props
    }, navigation);
