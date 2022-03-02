/**
 * ODE Mobile UI - Text
 * All typography components used in the app.
 * Do not use default React Native <Text> component, please use this one instead.
 * Don't forget to use <NestedText> instead of <Text> for nested text styles.
 */

import styled from '@emotion/native';
import { Platform, Text as RNText, TextStyle } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

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
  Action: { color: theme.color.secondary.regular },
  Important: { color: theme.color.primary.regular },
  Error: { color: theme.color.failure },
  Warning: { color: theme.color.warning },
  Inverse: { color: theme.color.text.inverse },
  Light: { color: theme.color.text.light },
  Heavy: { color: theme.color.text.heavy },
  Normal: { color: theme.color.text.regular },
} as { [key in TextColorStyleKey]: TextStyle };

// export const rem = (value: number) => baseFontSize * value;
export const rem = (value: number) => RFValue(value, UI_SIZES.standardScreen.height);
export const remlh = (value: number) => rem(value + 6);
export const remStyle = (value: number) => ({ fontSize: rem(value), lineHeight: remlh(value) });

type TextSizeStyleKey = 'Tiny' | 'Small' | 'Normal' | 'SlightBig' | 'Big' | 'Huge';

export const TextSizeStyle = {
  Tiny: remStyle(10),
  Small: remStyle(12),
  Normal: remStyle(14),
  SlightBig: remStyle(16),
  Big: remStyle(20),
  Huge: remStyle(28),
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
