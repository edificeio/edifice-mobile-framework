import style from "glamorous-native"
import { CommonStyles } from "../styles/common/styles";
import { layoutSize } from ".";

export const Bold = style.text({
	color: CommonStyles.textColor,
	fontSize: layoutSize.LAYOUT_14,
	fontFamily: CommonStyles.primaryFontFamily,
	fontWeight: "600",
});

export const Light = style.text({
	color: CommonStyles.textColor,
	fontSize: layoutSize.LAYOUT_12,
	fontFamily: CommonStyles.primaryFontFamilyLight,
	fontWeight: "400",
});

export const Paragraph = style.text({
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 12,
    color: CommonStyles.textColor
});

export const A = style.text({
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 12,
    marginTop: 10,
    color: CommonStyles.actionColor
});