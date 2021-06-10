/**
 * ODE Mobile UI - Text
 * All typography components used in the app.
 * Do not use default React Native <Text> component, please use this one instead.
 * Don't forget to use <NestedText> instead of <Text> for nested text styles.
 */

import { ColorValue, Text as RNText } from "react-native";
import styled from "@emotion/native";
import theme from "../util/theme";

/**
 * Font weights defined in this font family
 */
export enum FontWeight {
    Normal = "400",
    Light = "200",
    SemiBold = "600",
    Bold = "700",
}

/**
 * Main font properties of Pocket
 */
export const fontFamily = "OpenSans-Regular";
export const fontSize = 14;
export const lineHeight = 20;

/**
 * Main text colors
 */
export const TextColor: {[k in 'Action' | 'Error' | 'Warning' | 'Inverse' | 'Light' | 'Heavy' | 'Normal']: ColorValue} = {
    Action: theme.color.secondary.regular,
    Error: theme.color.failure,
    Warning: theme.color.warning,
    Inverse: theme.color.text.inverse,
    Light: theme.color.text.light,
    Heavy: theme.color.text.heavy,
    Normal: theme.color.text.regular
};

/**
 * Compute font size
 */
export const rem = (ratio: number) => fontSize * ratio;

export enum FontSize { // in rem
    Tiny = rem(10 / 14),
    Small = rem(12 / 14),
    Normal = rem(1),
    Big = rem(16 / 14),
    Huge = rem(2)
}

export const Text = styled.Text({
    fontFamily, fontSize, lineHeight, color: TextColor.Normal
})
export const NestedText = RNText;

export const TextBold = styled(Text)({
    fontWeight: FontWeight.Bold,
    color: TextColor.Heavy
})
export const NestedTextBold = styled.Text({
    fontWeight: FontWeight.Bold,
    color: TextColor.Heavy
})

export const TextSemiBold = styled(Text)({
    fontWeight: FontWeight.SemiBold,
    color: TextColor.Normal
})
export const NestedTextSemiBold = styled.Text({
    fontWeight: FontWeight.SemiBold,
    color: TextColor.Normal
})

export const TextItalic = styled(Text)({
    fontStyle: 'italic'
})
export const NestedTextItalic = styled.Text({
    fontStyle: 'italic'
})

export const TextLight = styled(Text)({
    fontWeight: FontWeight.Light,
    color: TextColor.Light
})
export const NestedTextLight = styled.Text({
    fontWeight: FontWeight.Light,
    color: TextColor.Light
})

export const TextInverse = styled(Text)({
    color: TextColor.Inverse
})
export const NestedTextInverse = styled.Text({
    color: TextColor.Inverse
})

export const H1 = styled(Text)({
    fontWeight: FontWeight.SemiBold,
    color: theme.color.secondary.regular,
    fontSize: 18,
})

export const TextAction = styled(Text)({
    color: TextColor.Action,
})