import style from "glamorous-native";
import {CommonStyles} from "../../styles/common/styles";
import {layoutSize} from "../../styles/common/layoutSize";

export const Item = style.touchableOpacity(
    {
        backgroundColor: CommonStyles.inputBackColor,
        paddingHorizontal: layoutSize.LAYOUT_16,
        paddingVertical: layoutSize.LAYOUT_12,
        borderBottomColor: CommonStyles.borderBottomItem,
        borderBottomWidth: 1,
        borderLeftWidth: 0,
        borderLeftColor: "transparent",
    }
)

export const LeftPanel = style.view({
    height: layoutSize.LAYOUT_50,
    width: layoutSize.LAYOUT_50,
})

export const CenterPanel = style.view(
    {
        flex: 1,
        alignItems: "flex-start",
        marginLeft: layoutSize.LAYOUT_5,
        marginRight: layoutSize.LAYOUT_54,
    }
)

export const ContainerContent = style.view(
    {
        borderBottomLeftRadius: layoutSize.LAYOUT_15,
        borderTopLeftRadius: layoutSize.LAYOUT_15,
        borderTopRightRadius: layoutSize.LAYOUT_15,
        justifyContent: "center",
        marginBottom: layoutSize.LAYOUT_10,
        padding: layoutSize.LAYOUT_20,
        shadowColor: CommonStyles.shadowColor,
        shadowOpacity: CommonStyles.shadowOpacity,
        shadowOffset: CommonStyles.shadowOffset,
        shadowRadius: CommonStyles.shadowRadius,
        backgroundColor: "white",
        borderBottomRightRadius: layoutSize.LAYOUT_15,
        elevation: layoutSize.LAYOUT_3,
    }
)

export const Content = style.text(
    {
        color: CommonStyles.iconColorOff,
        fontFamily: CommonStyles.primaryFontFamily,
        fontSize: layoutSize.LAYOUT_14,
    }
)

export const NbElement = style.text(
    {
        color: CommonStyles.iconColorOff,
        fontFamily: CommonStyles.primaryFontFamily,
        fontSize: layoutSize.LAYOUT_10,
    }
)

export const Owner = style.text(
    {
            color: CommonStyles.iconColorOff,
            fontFamily: CommonStyles.primaryFontFamily,
            fontSize: layoutSize.LAYOUT_10,
    }
)

