import style from "glamorous-native";
import { CommonStyles } from "../styles/common/styles";

export const Bold = style.text({
  // color: CommonStyles.textColor, // Bold text is always black
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  fontWeight: "600"
});

export const Italic = style.text({
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  fontStyle: "italic"
});

export const Light = style.text({
  color: CommonStyles.textColor, // Light text is always black
  fontFamily: CommonStyles.primaryFontFamilyLight,
  fontSize: 12,
  fontWeight: "400"
});

export const Heavy = style.text({
  color: CommonStyles.textColor, // Heavy text is always black
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  fontWeight: "600"
});

export const Paragraph = style.text(
  {
    color: CommonStyles.textColor,
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 14
  },
  ({ strong }: { strong?: boolean }) => ({
    fontFamily: strong
      ? CommonStyles.primaryFontFamilySemibold
      : CommonStyles.primaryFontFamily
  })
);

export const LightP = style.text({
  color: CommonStyles.lightTextColor,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14
});

export const Label = style.text({
  color: "#858FA9",
  fontFamily: CommonStyles.primaryFontFamilyLight,
  fontSize: 14,
  fontWeight: "400",
  textAlignVertical: "center"
});

export const Quote = style.text({
  color: "rgba(133,143,169,1)",
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 12,
  fontWeight: "400",
  marginBottom: 20,
  marginTop: 20,
  textAlign: "center"
});

export const A = style.text({
  color: CommonStyles.actionColor,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14
});

export const H4 = style.text({
  color: "#414355",
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  fontWeight: "400",
  marginTop: 40,
  paddingHorizontal: 20
});

export const H1 = style.text({
  color: CommonStyles.primary,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 18,
  fontWeight: "600",
  marginBottom: 20,
  marginTop: 20
});

export const ErrorMessage = style.text({
  alignSelf: "center",
  color: CommonStyles.errorColor,
  flexGrow: 0,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  marginTop: 15,
  padding: 5,
  textAlign: "center"
});
