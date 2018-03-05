import style from "glamorous-native"
import { CommonStyles } from "../styles/common/styles";

export const Bold = style.text({
	color: CommonStyles.textColor,
	fontSize: 14,
	fontFamily: CommonStyles.primaryFontFamily,
	fontWeight: "600",
});

export const Light = style.text({
	color: CommonStyles.textColor,
	fontSize: 12,
	fontFamily: CommonStyles.primaryFontFamilyLight,
	fontWeight: "400",
});

export const Paragraph = style.text({
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 12,
    color: CommonStyles.textColor
});

export const Quote = style.text({
	color: 'rgba(133,143,169,1)',
    fontFamily: CommonStyles.primaryFontFamily,
	fontSize: 14,
	fontWeight: "400",
	textAlign: 'center',
	marginTop: 20,
	marginBottom: 20
});

export const A = style.text({
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 12,
    marginTop: 10,
    color: CommonStyles.actionColor
});

export const H1 = style.text({
	color: CommonStyles.primary,
	fontSize: 18,
	fontFamily: CommonStyles.primaryFontFamily,
	fontWeight: "600",
	marginTop: 20,
	marginBottom: 20
});

export const ErrorMessage = style.text({
	alignSelf: "center",
	color: CommonStyles.errorColor,
	height: layoutSize.LAYOUT_32,
	fontFamily: CommonStyles.primaryFontFamily,
	fontSize: layoutSize.LAYOUT_14,
	paddingTop: layoutSize.LAYOUT_4,
	flex: 1,
})
