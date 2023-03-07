/**
 * ODE Mobile UI - Text
 * All typography components used in the app.
 * Do not use default React Native <Text> component, please use this one instead.
 * Don't forget to use <NestedText> instead of <Text> for nested text styles.
 */
import styled from '@emotion/native';
import { Platform, Text as RNText, TextStyle } from 'react-native';

import theme from '~/app/theme';

import { getScaleFontSize, getScaleHeight } from './constants';

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
  Normal: '400',
  Bold: '700',
};

type TextFontStyleKey = 'Regular' | 'Italic' | 'Bold' | 'BoldItalic';
export const TextFontStyle = Platform.select({
  ios: {
    Regular: { fontFamily: textFontFamilyIOS, color: theme.ui.text.regular },
    Italic: { fontFamily: textFontFamilyIOS, color: theme.ui.text.regular, fontStyle: 'italic' },
    Bold: { fontFamily: textFontFamilyIOS, color: theme.ui.text.regular, fontWeight: FontWeightIOS.Bold },
    BoldItalic: {
      fontFamily: textFontFamilyIOS,
      color: theme.ui.text.regular,
      fontWeight: FontWeightIOS.Bold,
      fontStyle: 'italic',
    },
  },
  android: {
    Regular: { fontFamily: `${textFontFamilyPrefixAndroid}regular`, color: theme.ui.text.regular },
    Italic: { fontFamily: `${textFontFamilyPrefixAndroid}italic`, color: theme.ui.text.regular },
    Bold: { fontFamily: `${textFontFamilyPrefixAndroid}bold`, color: theme.ui.text.regular },
    BoldItalic: { fontFamily: `${textFontFamilyPrefixAndroid}bolditalic`, color: theme.ui.text.regular },
  },
})! as { [key in TextFontStyleKey]: TextStyle };

type HeadingFontStyleKey = 'Bold';
export const HeadingFontStyle = Platform.select({
  ios: {
    Bold: { fontFamily: headingFontFamilyIOS, color: theme.ui.text.regular, fontWeight: FontWeightIOS.Bold },
  },
  android: {
    Bold: { fontFamily: `${headingFontFamilyPrefixAndroid}bold`, color: theme.ui.text.regular },
  },
})! as { [key in HeadingFontStyleKey]: TextStyle };

type TextSizeStyleKey = 'Small' | 'Normal' | 'Medium' | 'Big' | 'Huge' | 'Giant';
export const TextSizeStyle = {
  Small: {
    fontSize: getScaleFontSize(12),
    lineHeight: getScaleHeight(20),
  },
  Normal: {
    fontSize: getScaleFontSize(14),
    lineHeight: getScaleHeight(22),
  },
  Medium: {
    fontSize: getScaleFontSize(16),
    lineHeight: getScaleHeight(24),
  },
  Big: {
    fontSize: getScaleFontSize(18),
    lineHeight: getScaleHeight(26),
  },
  Huge: {
    fontSize: getScaleFontSize(26),
    lineHeight: getScaleHeight(34),
  },
  Giant: {
    fontSize: getScaleFontSize(32),
    lineHeight: getScaleHeight(38),
  },
} as { [key in TextSizeStyleKey]: TextStyle };

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

export const HeadingSText = styled.Text({
  ...HeadingFontStyle.Bold,
  ...TextSizeStyle.Big,
});

export const HeadingXSText = styled.Text({
  ...HeadingFontStyle.Bold,
  ...TextSizeStyle.Medium,
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
