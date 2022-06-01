/**
 * ODE Mobile UI - Text
 * All typography components used in the app.
 * Do not use default React Native <Text> component, please use this one instead.
 * Don't forget to use <NestedText> instead of <Text> for nested text styles.
 */
import styled from '@emotion/native';
import { Platform, Text as RNText, TextStyle } from 'react-native';

import theme from '~/app/theme';

import { UI_SIZES } from './constants';

/**
 * Base font properties
 */
const fontFamilyIOS = 'Open Sans';
const fontFamilyPrefixAndroid = 'opensans_';

/**
 * Font variations
 */
export const FontWeightIOS = {
  // 🤣🤣🤣 MEGA LOL Typescript. I must explicitly type these as their value otherwise it is treated as string
  Normal: '400' as '400',
  Light: '300' as '300',
  SemiBold: '600' as '600',
  Bold: '700' as '700',
};

type FontStyleKey = 'Regular' | 'Italic' | 'Bold' | 'BoldItalic' | 'SemiBold' | 'SemiBoldItalic' | 'Light' | 'LightItalic';
export const FontStyle = Platform.select({
  ios: {
    Regular: { fontFamily: fontFamilyIOS },
    Italic: { fontFamily: fontFamilyIOS, fontStyle: 'italic' },
    Bold: { fontFamily: fontFamilyIOS, fontWeight: FontWeightIOS.Bold },
    BoldItalic: { fontFamily: fontFamilyIOS, fontWeight: FontWeightIOS.Bold, fontStyle: 'italic' },
    SemiBold: { fontFamily: fontFamilyIOS, fontWeight: FontWeightIOS.SemiBold },
    SemiBoldItalic: { fontFamily: fontFamilyIOS, fontWeight: FontWeightIOS.SemiBold, fontStyle: 'italic' },
    Light: { fontFamily: fontFamilyIOS, fontWeight: FontWeightIOS.Light },
    LightItalic: { fontFamily: fontFamilyIOS, fontWeight: FontWeightIOS.Light, fontStyle: 'italic' },
  },
  android: {
    Regular: { fontFamily: fontFamilyPrefixAndroid + 'regular' },
    Italic: { fontFamily: fontFamilyPrefixAndroid + 'italic' },
    Bold: { fontFamily: fontFamilyPrefixAndroid + 'bold' },
    BoldItalic: { fontFamily: fontFamilyPrefixAndroid + 'bolditalic' },
    SemiBold: { fontFamily: fontFamilyPrefixAndroid + 'semibold' },
    SemiBoldItalic: { fontFamily: fontFamilyPrefixAndroid + 'semibolditalic' },
    Light: { fontFamily: fontFamilyPrefixAndroid + 'light' },
    LightItalic: { fontFamily: fontFamilyPrefixAndroid + 'lightitalic' },
  },
})! as { [key in FontStyleKey]: TextStyle };

type TextColorStyleKey = 'Action' | 'Important' | 'Error' | 'Warning' | 'Inverse' | 'Light' | 'Heavy' | 'Normal';
export const TextColorStyle = {
  Action: { color: theme.palette.primary.regular },
  Important: { color: theme.palette.secondary.regular },
  Error: { color: theme.palette.status.failure },
  Warning: { color: theme.palette.status.warning },
  Inverse: { color: theme.ui.text.inverse },
  Light: { color: theme.ui.text.light },
  Heavy: { color: theme.ui.text.heavy },
  Normal: { color: theme.ui.text.regular },
} as { [key in TextColorStyleKey]: TextStyle };

type TextSizeStyleKey = 'Tiny' | 'Small' | 'Normal' | 'SlightBig' | 'Big' | 'Huge';

const responsiveStyle = (value: number) => ({
  fontSize: UI_SIZES.getResponsiveFontSize(value),
  lineHeight: UI_SIZES.getResponsiveLineHeight(value),
});

export const TextSizeStyle = {
  Tiny: responsiveStyle(10),
  Small: responsiveStyle(12),
  Normal: responsiveStyle(14),
  SlightBig: responsiveStyle(16),
  Big: responsiveStyle(20),
  Huge: responsiveStyle(28),
} as { [key in TextSizeStyleKey]: TextStyle };

/**
 * Font components
 */

export const Text = styled.Text({
  ...FontStyle.Regular,
  ...TextSizeStyle.Normal,
  ...TextColorStyle.Normal,
});
export const NestedText = RNText;

export const TextBold = styled(Text)({
  ...FontStyle.Bold,
  ...TextColorStyle.Heavy,
});
export const NestedTextBold = styled.Text({
  ...FontStyle.Bold,
  ...TextColorStyle.Heavy,
});

export const TextSemiBold = styled(Text)({
  ...FontStyle.SemiBold,
  ...TextColorStyle.Normal,
});
export const NestedTextSemiBold = styled.Text({
  ...FontStyle.SemiBold,
  ...TextColorStyle.Normal,
});

export const TextItalic = styled(Text)({
  ...FontStyle.Italic,
});
export const NestedTextItalic = styled.Text({
  ...FontStyle.Italic,
});

export const TextLight = styled(Text)({
  ...FontStyle.Light,
  ...TextColorStyle.Light,
});
export const NestedTextLight = styled.Text({
  ...FontStyle.Light,
  ...TextColorStyle.Light,
});

export const TextLightItalic = styled(TextLight)({
  ...FontStyle.LightItalic,
});
export const NestedTextLightItalic = styled(NestedTextLight)({
  ...FontStyle.LightItalic,
});

export const TextInverse = styled(Text)({
  ...TextColorStyle.Inverse,
});
export const NestedTextInverse = styled.Text({
  ...TextColorStyle.Inverse,
});

export const H1 = styled(Text)({
  ...FontStyle.SemiBold,
  ...TextColorStyle.Normal,
  fontSize: 18,
});

export const TextAction = styled(Text)({
  ...TextColorStyle.Action,
});
export const NestedTextAction = styled.Text({
  ...TextColorStyle.Action,
});
