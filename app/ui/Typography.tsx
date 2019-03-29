import glamorous from "glamorous-native";
import { Text as RNText } from "react-native";
import { CommonStyles } from "../styles/common/styles";

/**
 * Font weights defined in this font family
 */
export enum Weight {
  Normal = "400",
  Light = "200",
  SemiBold = "600",
  Bold = "700"
}

/**
 * Main font properties of Pocket
 */
export const fontFamily = CommonStyles.primaryFontFamily;
export const fontSize = 14;

/**
 * Main text colors
 */
export const TextColor = {
  Action: CommonStyles.actionColor,
  Error: CommonStyles.errorColor,
  Inverse: CommonStyles.white,
  Light: CommonStyles.lightTextColor,
  Normal: CommonStyles.textColor
};

/**
 * Compute font size
 */
export const rem = (ratio: number) => fontSize * ratio;

/**
 * Overloaded Text element. Use it everywhere instead of ReactNative.Text.
 */
export const Text = glamorous.text({
  color: TextColor.Normal,
  fontFamily,
  fontSize
});

export const TextItalic = glamorous(Text)({
  fontStyle: "italic"
});

export const TextLight = glamorous(Text)({
  fontWeight: Weight.Light
});

export const TextLightItalic = glamorous(TextLight)({
  fontStyle: "italic"
});

export const TextSemiBold = glamorous(Text)({
  fontWeight: Weight.SemiBold
});

export const TextSemiBoldItalic = glamorous(TextSemiBold)({
  fontStyle: "italic"
});

export const TextBold = glamorous(Text)({
  fontWeight: Weight.Bold
});

export const TextBoldItalic = glamorous(TextBold)({
  fontStyle: "italic"
});

export const TextBright = glamorous(TextLight)({
  color: TextColor.Light
});

//////// LEGACY CODE BELOW

export const Bold = glamorous.text({
  // color: CommonStyles.textColor, // Bold text is always black
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  fontWeight: "600"
});

export const Italic = glamorous.text({
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  fontStyle: "italic"
});

export const Light = glamorous.text({
  color: CommonStyles.textColor, // Light text is always black
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 12,
  fontWeight: "400"
});

export const Heavy = glamorous.text({
  color: CommonStyles.textColor, // Heavy text is always black
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  fontWeight: "600"
});

export const Paragraph = glamorous.text(
  {
    color: CommonStyles.textColor,
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 14
  },
  ({ strong }: { strong?: boolean }) => ({
    fontFamily: strong
      ? CommonStyles.primaryFontFamily
      : CommonStyles.primaryFontFamily
  })
);

export const LightP = glamorous.text({
  color: CommonStyles.lightTextColor,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14
});

export const Label = glamorous.text({
  color: CommonStyles.lightTextColor,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  fontWeight: "400",
  textAlignVertical: "center"
});

export const Quote = glamorous.text({
  color: CommonStyles.lightTextColor,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 12,
  fontWeight: "400",
  marginBottom: 20,
  marginTop: 20,
  textAlign: "center"
});

export const A = glamorous.text({
  color: CommonStyles.actionColor,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14
});

export const Link = glamorous.text({
  // Neutral link does not show a particular color
  // color: CommonStyles.actionColor,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14
});

export const H4 = glamorous.text({
  color: CommonStyles.textColor,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  fontWeight: "400",
  marginTop: 40,
  paddingHorizontal: 20
});

export const H1 = glamorous.text({
  color: CommonStyles.primary,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 18,
  fontWeight: "600",
  marginBottom: 20,
  marginTop: 20
});

export const ErrorMessage = glamorous.text({
  alignSelf: "center",
  color: CommonStyles.errorColor,
  flexGrow: 0,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  marginTop: 15,
  padding: 5,
  textAlign: "center"
});

export const InfoMessage = glamorous.text({
  alignSelf: "center",
  color: CommonStyles.textColor,
  flexGrow: 0,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  marginTop: 15,
  padding: 5,
  textAlign: "center"
});
