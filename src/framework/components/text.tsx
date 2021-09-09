/**
 * ODE Mobile UI - Text
 * All typography components used in the app.
 * Do not use default React Native <Text> component, please use this one instead.
 * Don't forget to use <NestedText> instead of <Text> for nested text styles.
 */

import { Platform, Text as RNText, TextStyle } from "react-native";
import styled from "@emotion/native";
import theme from "../util/theme";

console.log("test font begin")

/**
 * Base font properties
 */
const fontFamilyIOS = "Open Sans";
const fontFamilyPrefixAndroid = "opensans_";
const baseFontSize = 14;
const baseLineHeight = 20;

/**
 * Font variations
 */
export const FontWeightIOS = {
    Normal: "400",
    Light: "300",
    SemiBold: "600",
    Bold: "700",
}

type FontStyleKey = 'Regular' | 'Italic' | 'Bold' | 'BoldItalic' | 'SemiBold' | 'SemiBoldItalic' | 'Light' | 'LightItalic';
export const FontStyle = Platform.select({
    ios: {
        Regular: { fontFamily: fontFamilyIOS },
        Italic: { fontFamily: fontFamilyIOS, fontStyle: "italic" },
        Bold: { fontFamily: fontFamilyIOS, fontWeight: FontWeightIOS.Bold },
        BoldItalic: { fontFamily: fontFamilyIOS, fontWeight: FontWeightIOS.Bold, fontStyle: "italic" },
        SemiBold: { fontFamily: fontFamilyIOS, fontWeight: FontWeightIOS.SemiBold },
        SemiBoldItalic: { fontFamily: fontFamilyIOS, fontWeight: FontWeightIOS.SemiBold, fontStyle: "italic" },
        Light: { fontFamily: fontFamilyIOS, fontWeight: FontWeightIOS.Light },
        LightItalic: { fontFamily: fontFamilyIOS, fontWeight: FontWeightIOS.Light, fontStyle: "italic" },
    },
    android: {
        Regular: { fontFamily: fontFamilyPrefixAndroid + "regular" },
        Italic: { fontFamily: fontFamilyPrefixAndroid + "italic" },
        Bold: { fontFamily: fontFamilyPrefixAndroid + "bold" },
        BoldItalic: { fontFamily: fontFamilyPrefixAndroid + "bolditalic" },
        SemiBold: { fontFamily: fontFamilyPrefixAndroid + "semibold" },
        SemiBoldItalic: { fontFamily: fontFamilyPrefixAndroid + "semibolditalic" },
        Light: { fontFamily: fontFamilyPrefixAndroid + "light" },
        LightItalic: { fontFamily: fontFamilyPrefixAndroid + "lightitalic" },
    }
})! as { [key in FontStyleKey]: TextStyle };

type TextColorStyleKey = 'Action' | 'Error' | 'Warning' | 'Inverse' | 'Light' | 'Heavy' | 'Normal';
export const TextColorStyle = {
    Action: { color: theme.color.secondary.regular },
    Error: { color: theme.color.failure },
    Warning: { color: theme.color.warning },
    Inverse: { color: theme.color.text.inverse },
    Light: { color: theme.color.text.light },
    Heavy: { color: theme.color.text.heavy },
    Normal: { color: theme.color.text.regular }
} as { [key in TextColorStyleKey]: TextStyle };

export const rem = (value: number) => baseFontSize * value;
export const remlh = (value: number) => baseLineHeight * value;
export const remStyle = (value: number) => ({ fontSize: rem(value), lineHeight: remlh(value) });
type TextSizeStyleKey = 'Tiny' | 'Small' | 'Normal' | 'Big' | 'Huge';
export const TextSizeStyle = {
    Tiny: remStyle(10 / 14),
    Small: remStyle(12 / 14),
    Normal: remStyle(1),
    Big: remStyle(20 / 14),
    Huge: remStyle(2),
} as { [key in TextSizeStyleKey]: TextStyle };

/**
 * Font components
 */

export const Text = styled.Text({
    ...FontStyle.Regular, ...TextSizeStyle.Normal, ...TextColorStyle.Normal
});
export const NestedText = RNText;

export const TextBold = styled(Text)({
    ...FontStyle.Bold, ...TextColorStyle.Heavy
});
export const NestedTextBold = styled.Text({
    ...FontStyle.Bold, ...TextColorStyle.Heavy
})

export const TextSemiBold = styled(Text)({
    ...FontStyle.SemiBold, ...TextColorStyle.Normal
})
export const NestedTextSemiBold = styled.Text({
    ...FontStyle.SemiBold, ...TextColorStyle.Normal
})

export const TextItalic = styled(Text)({
    ...FontStyle.Italic
})
export const NestedTextItalic = styled.Text({
    ...FontStyle.Italic
})

export const TextLight = styled(Text)({
    ...FontStyle.Light, ...TextColorStyle.Light
})
export const NestedTextLight = styled.Text({
    ...FontStyle.Light, ...TextColorStyle.Light
})

export const TextLightItalic = styled(TextLight)({
    ...FontStyle.LightItalic
})
export const NestedTextLightItalic = styled(NestedTextLight)({
    ...FontStyle.LightItalic
})

export const TextInverse = styled(Text)({
    ...TextColorStyle.Inverse
})
export const NestedTextInverse = styled.Text({
    ...TextColorStyle.Inverse
})

export const H1 = styled(Text)({
    ...FontStyle.SemiBold,
    ...TextColorStyle.Normal,
    fontSize: 18,
})

export const TextAction = styled(Text)({
    ...TextColorStyle.Action,
})
export const NestedTextAction = styled.Text({
    ...TextColorStyle.Action,
})
