/**
 * ODE Mobile UI - Text
 * All typography components used in the app.
 * Do not use default React Native <Text> component, please use this one instead.
 * Don't forget to use <NestedText> instead of <Text> for nested text styles.
 */
// eslint-disable-next-line no-restricted-imports
import { PixelRatio, Platform, Text as RNText, TextStyle } from 'react-native';

import styled from '@emotion/native';

import theme from '~/app/theme';
import { getScaleFontSize } from '~/framework/components/constants';

/**
 * Base font properties
 */
const headingFontFamilyIOS = 'Comfortaa';
const headingFontFamilyPrefixAndroid = 'comfortaa_';
const textFontFamilyIOS = 'Font';
const textFontFamilyPrefixAndroid = 'font_';

/**
 * Font variations
 */
const FontWeightIOS = {
  Bold: '700',
  Normal: '400',
};

type TextFontStyleKey = 'Regular' | 'Italic' | 'Bold' | 'BoldItalic';
export const TextFontStyle = Platform.select({
  android: {
    Bold: { color: theme.ui.text.regular, fontFamily: `${textFontFamilyPrefixAndroid}bold` },
    BoldItalic: { color: theme.ui.text.regular, fontFamily: `${textFontFamilyPrefixAndroid}bolditalic` },
    Italic: { color: theme.ui.text.regular, fontFamily: `${textFontFamilyPrefixAndroid}italic` },
    Regular: { color: theme.ui.text.regular, fontFamily: `${textFontFamilyPrefixAndroid}regular` },
  },
  ios: {
    Bold: { color: theme.ui.text.regular, fontFamily: textFontFamilyIOS, fontWeight: FontWeightIOS.Bold },
    BoldItalic: {
      color: theme.ui.text.regular,
      fontFamily: textFontFamilyIOS,
      fontStyle: 'italic',
      fontWeight: FontWeightIOS.Bold,
    },
    Italic: { color: theme.ui.text.regular, fontFamily: textFontFamilyIOS, fontStyle: 'italic' },
    Regular: { color: theme.ui.text.regular, fontFamily: textFontFamilyIOS },
  },
})! as { [key in TextFontStyleKey]: TextStyle };

type HeadingFontStyleKey = 'Bold';
export const HeadingFontStyle = Platform.select({
  android: {
    Bold: { color: theme.ui.text.regular, fontFamily: `${headingFontFamilyPrefixAndroid}bold` },
  },
  ios: {
    Bold: { color: theme.ui.text.regular, fontFamily: headingFontFamilyIOS, fontWeight: FontWeightIOS.Bold },
  },
})! as { [key in HeadingFontStyleKey]: TextStyle };

export type TextSizeStyleKey = 'Small' | 'Normal' | 'Medium' | 'Big' | 'Bigger' | 'Huge' | 'Giant';

const getNormalizedLineHeight = (fontSize: number): number => getScaleFontSize(fontSize);

export const TextSizeStyle = {
  Big: {
    fontSize: getScaleFontSize(18),
    lineHeight: getNormalizedLineHeight(26),
  },
  Bigger: {
    fontSize: getScaleFontSize(22),
    lineHeight: getNormalizedLineHeight(30),
  },
  Giant: {
    fontSize: getScaleFontSize(32),
    lineHeight: getNormalizedLineHeight(38),
  },
  Huge: {
    fontSize: getScaleFontSize(26),
    lineHeight: getNormalizedLineHeight(34),
  },
  Medium: {
    fontSize: getScaleFontSize(16),
    lineHeight: getNormalizedLineHeight(24),
  },
  Normal: {
    fontSize: getScaleFontSize(14),
    lineHeight: getNormalizedLineHeight(22),
  },
  Small: {
    fontSize: getScaleFontSize(12),
    lineHeight: getNormalizedLineHeight(20),
  },
} as { [key in TextSizeStyleKey]: Required<Pick<TextStyle, 'fontSize' | 'lineHeight'>> };

/**
 * @param textSizeKey : contains the lineHeight and fontSize being used
 * @returns : line height adjusted to minimize iOS's interlines spacing
 */
export const getLineHeight = (textSizeKey: TextSizeStyleKey): number => {
  const defaultStyle = TextSizeStyle[textSizeKey];
  let lineHeightFix: number;
  Platform.OS === 'ios'
    ? (lineHeightFix = defaultStyle.lineHeight * PixelRatio.getFontScale())
    : (lineHeightFix = defaultStyle.lineHeight);

  return lineHeightFix;
};

/**
 * Heading
 */

export const HeadingXLText = styled.Text({
  ...HeadingFontStyle.Bold,
  ...TextSizeStyle.Giant,
});

export const HeadingLText = styled.Text({
  ...HeadingFontStyle.Bold,
  ...TextSizeStyle.Huge,
});

export const HeadingMText = styled.Text({
  ...HeadingFontStyle.Bold,
  ...TextSizeStyle.Bigger,
});

export const HeadingSText = styled.Text({
  ...HeadingFontStyle.Bold,
  ...TextSizeStyle.Big,
});

export const HeadingXSText = styled.Text({
  ...HeadingFontStyle.Bold,
  ...TextSizeStyle.Medium,
});

export const HeadingXXSText = styled.Text({
  ...HeadingFontStyle.Bold,
  ...TextSizeStyle.Small,
});

/**
 * Body Text
 */

export const BodyText = styled.Text({
  ...TextFontStyle.Regular,
  ...TextSizeStyle.Medium,
});

export const BodyBoldText = styled.Text({
  ...TextFontStyle.Bold,
  ...TextSizeStyle.Medium,
});

export const BodyItalicText = styled.Text({
  ...TextFontStyle.Italic,
  ...TextSizeStyle.Medium,
});

export const BodyBoldItalicText = styled.Text({
  ...TextFontStyle.BoldItalic,
  ...TextSizeStyle.Medium,
});

/**
 * Small Text
 */

export const SmallText = styled.Text({
  ...TextFontStyle.Regular,
  ...TextSizeStyle.Normal,
});

export const SmallBoldText = styled.Text({
  ...TextFontStyle.Bold,
  ...TextSizeStyle.Normal,
});

export const SmallItalicText = styled.Text({
  ...TextFontStyle.Italic,
  ...TextSizeStyle.Normal,
});

export const SmallBoldItalicText = styled.Text({
  ...TextFontStyle.BoldItalic,
  ...TextSizeStyle.Normal,
});

/**
 * Caption
 */

export const CaptionText = styled.Text({
  ...TextFontStyle.Regular,
  ...TextSizeStyle.Small,
});

export const CaptionBoldText = styled.Text({
  ...TextFontStyle.Bold,
  ...TextSizeStyle.Small,
});

export const CaptionItalicText = styled.Text({
  ...TextFontStyle.Italic,
  ...TextSizeStyle.Small,
});

export const CaptionBoldItalicText = styled.Text({
  ...TextFontStyle.BoldItalic,
  ...TextSizeStyle.Small,
});

/**
 * Inverse Text
 */

export const SmallInverseText = styled(SmallText)({
  color: theme.ui.text.inverse,
});

export const SmallActionText = styled(SmallText)({
  color: theme.palette.primary.regular,
});

/**
 * Nested Text
 */

export const NestedText = RNText;

export const NestedBoldText = styled.Text({
  ...TextFontStyle.Bold,
});

export const NestedItalicText = styled.Text({
  ...TextFontStyle.Italic,
});

export const NestedActionText = styled.Text({
  color: theme.palette.primary.regular,
});
