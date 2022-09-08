/**
 * ODE Mobile UI - Text
 * All typography components used in the app.
 * Do not use default React Native <Text> component, please use this one instead.
 * Don't forget to use <NestedText> instead of <Text> for nested text styles.
 */
import styled from '@emotion/native';
import { Platform, Text as RNText, TextStyle } from 'react-native';

import theme from '~/app/theme';
import appConf from '~/framework/util/appConf';

import { getScaleDimension } from './constants';

/**
 * Base font properties
 */
const isApp1D = appConf.is1d;
const headingFontFamilyIOS = 'Comfortaa';
const headingFontFamilyPrefixAndroid = 'comfortaa_';
const textFontFamilyIOS = isApp1D ? 'Arimo' : 'Roboto';
const textFontFamilyPrefixAndroid = isApp1D ? 'arimo_' : 'roboto_';

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
    Regular: { fontFamily: textFontFamilyIOS },
    Italic: { fontFamily: textFontFamilyIOS, fontStyle: 'italic' },
    Bold: { fontFamily: textFontFamilyIOS, fontWeight: FontWeightIOS.Bold },
    BoldItalic: { fontFamily: textFontFamilyIOS, fontWeight: FontWeightIOS.Bold, fontStyle: 'italic' },
  },
  android: {
    Regular: { fontFamily: `${textFontFamilyPrefixAndroid}regular` },
    Italic: { fontFamily: `${textFontFamilyPrefixAndroid}italic` },
    Bold: { fontFamily: `${textFontFamilyPrefixAndroid}bold` },
    BoldItalic: { fontFamily: `${textFontFamilyPrefixAndroid}bolditalic` },
  },
})! as { [key in TextFontStyleKey]: TextStyle };

type HeadingFontStyleKey = 'Bold';
export const HeadingFontStyle = Platform.select({
  ios: {
    Bold: { fontFamily: headingFontFamilyIOS, fontWeight: FontWeightIOS.Bold },
  },
  android: {
    Bold: { fontFamily: `${headingFontFamilyPrefixAndroid}bold` },
  },
})! as { [key in HeadingFontStyleKey]: TextStyle };

type TextSizeStyleKey = 'Small' | 'Normal' | 'Medium' | 'Big' | 'Huge';
export const TextSizeStyle = {
  Small: {
    fontSize: getScaleDimension(12, 'font'),
    lineHeight: getScaleDimension(20, 'height'),
  },
  Normal: {
    fontSize: getScaleDimension(14, 'font'),
    lineHeight: getScaleDimension(22, 'height'),
  },
  Medium: {
    fontSize: getScaleDimension(16, 'font'),
    lineHeight: getScaleDimension(24, 'height'),
  },
  Big: {
    fontSize: getScaleDimension(18, 'font'),
    lineHeight: getScaleDimension(26, 'height'),
  },
  Huge: {
    fontSize: getScaleDimension(26, 'font'),
    lineHeight: getScaleDimension(34, 'height'),
  },
} as { [key in TextSizeStyleKey]: TextStyle };

/**
 * Font components
 */
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

export const SmallInverseText = styled(SmallText)({
  color: theme.ui.text.inverse,
});
export const SmallActionText = styled(SmallText)({
  color: theme.palette.primary.regular,
});

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
