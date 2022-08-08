/**
 * ODE Mobile UI - Text
 * All typography components used in the app.
 * Do not use default React Native <Text> component, please use this one instead.
 * Don't forget to use <NestedText> instead of <Text> for nested text styles.
 */
import styled from '@emotion/native';
import I18n from 'i18n-js';
import { Platform, Text as RNText, TextStyle } from 'react-native';

import theme from '~/app/theme';

import { getScaleDimension } from './constants';

/**
 * Base font properties
 */
const appName = I18n.t('common.appName');
const isAppOne = appName.includes('ONE Pocket');
const headingFontFamilyIOS = 'Comfortaa';
const headingFontFamilyPrefixAndroid = 'comfortaa_';
const textFontFamilyIOS = isAppOne ? 'Arimo' : 'Roboto';
const textFontFamilyPrefixAndroid = isAppOne ? 'arimo_' : 'roboto_';

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
export const HeadingL = styled.Text({
  ...HeadingFontStyle.Bold,
  ...TextSizeStyle.Huge,
});
export const HeadingS = styled.Text({
  ...HeadingFontStyle.Bold,
  ...TextSizeStyle.Big,
});
export const HeadingXS = styled.Text({
  ...HeadingFontStyle.Bold,
  ...TextSizeStyle.Medium,
});

export const Body = styled.Text({
  ...TextFontStyle.Regular,
  ...TextSizeStyle.Medium,
});
export const BodyBold = styled.Text({
  ...TextFontStyle.Bold,
  ...TextSizeStyle.Medium,
});
export const BodyItalic = styled.Text({
  ...TextFontStyle.Italic,
  ...TextSizeStyle.Medium,
});
export const BodyBoldItalic = styled.Text({
  ...TextFontStyle.BoldItalic,
  ...TextSizeStyle.Medium,
});

export const Small = styled.Text({
  ...TextFontStyle.Regular,
  ...TextSizeStyle.Normal,
});
export const SmallBold = styled.Text({
  ...TextFontStyle.Bold,
  ...TextSizeStyle.Normal,
});
export const SmallItalic = styled.Text({
  ...TextFontStyle.Italic,
  ...TextSizeStyle.Normal,
});
export const SmallBoldItalic = styled.Text({
  ...TextFontStyle.BoldItalic,
  ...TextSizeStyle.Normal,
});

export const Caption = styled.Text({
  ...TextFontStyle.Regular,
  ...TextSizeStyle.Small,
});
export const CaptionBold = styled.Text({
  ...TextFontStyle.Bold,
  ...TextSizeStyle.Small,
});
export const CaptionItalic = styled.Text({
  ...TextFontStyle.Italic,
  ...TextSizeStyle.Small,
});
export const CaptionBoldItalic = styled.Text({
  ...TextFontStyle.BoldItalic,
  ...TextSizeStyle.Small,
});

export const SmallInverse = styled(Small)({
  color: theme.ui.text.inverse,
});
export const SmallAction = styled(Small)({
  color: theme.palette.primary.regular,
});

export const NestedText = RNText;
export const NestedTextBold = styled.Text({
  ...TextFontStyle.Bold,
});
export const NestedTextItalic = styled.Text({
  ...TextFontStyle.Italic,
});
export const NestedTextAction = styled.Text({
  color: theme.palette.primary.regular,
});
