import { CommonStyles } from "../../styles/common/styles";

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
            height: 56,
            ...(props.headerStyle || {})
        },
        headerTitleStyle: {
            alignSelf: "center",
            color: "white",
            fontFamily: CommonStyles.primaryFontFamily,
            fontSize: 16,
            fontWeight: "400",
            textAlign: "center",
            flex: 1,
            ...(props.headerTitleStyle || {})
        },
    };
};

/**
 * Options for a header with left-aligned title
 */
export const alternativeNavScreenOptions = (props, navigation) =>
    standardNavScreenOptions({
        headerTitleStyle: { textAlign: "left", marginHorizontal: 0 },
        ...props
    }, navigation);
