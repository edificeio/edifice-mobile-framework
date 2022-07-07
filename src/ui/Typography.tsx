import styled from '@emotion/native';

import { UI_SIZES } from '~/framework/components/constants';
import { CommonStyles } from '~/styles/common/styles';

/**
 * Font weights defined in this font family
 */
export enum Weight {
  Normal = '400',
  Light = '200',
  SemiBold = '600',
  Bold = '700',
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
  Normal: CommonStyles.textColor,
};

/**
 * Compute font size
 */
export const rem = (ratio: number) => fontSize * ratio;

/**
 * Overloaded Text element. Use it everywhere instead of ReactNative.Text.
 */
export const Text = styled.Text({
  color: TextColor.Normal,
  fontFamily,
  fontSize,
});

export const TextItalic = styled(Text)({
  fontStyle: 'italic',
});

export const TextLight = styled(Text)({
  fontWeight: Weight.Light,
});

export const TextLightItalic = styled(TextLight)({
  fontStyle: 'italic',
});

export const TextSemiBold = styled(Text)({
  fontWeight: Weight.SemiBold,
});

export const TextSemiBoldItalic = styled(TextSemiBold)({
  fontStyle: 'italic',
});

export const TextBold = styled(Text)({
  fontWeight: Weight.Bold,
});

export const TextBoldItalic = styled(TextBold)({
  fontStyle: 'italic',
});

export const TextBright = styled(TextLight)({
  color: TextColor.Light,
});

//////// LEGACY CODE BELOW

export const Bold = styled.Text({
  // color: CommonStyles.textColor, // Bold text is always black
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  fontWeight: '600',
});

export const Italic = styled.Text({
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  fontStyle: 'italic',
});

export const Light = styled.Text({
  color: CommonStyles.textColor, // Light text is always black
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 12,
  fontWeight: '400',
});

export const Heavy = styled.Text({
  color: CommonStyles.textColor, // Heavy text is always black
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  fontWeight: '600',
});

export const Paragraph = styled.Text(
  {
    color: CommonStyles.textColor,
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 14,
  },
  ({ strong }: { strong?: boolean }) => ({
    fontFamily: strong ? CommonStyles.primaryFontFamily : CommonStyles.primaryFontFamily,
  }),
);

export const LightP = styled.Text({
  color: CommonStyles.lightTextColor,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
});

export const Label = styled.Text({
  color: CommonStyles.lightTextColor,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  fontWeight: '400',
  textAlignVertical: 'center',
});

export const A = styled.Text({
  color: CommonStyles.actionColor,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
});

export const Link = styled.Text({
  // Neutral link does not show a particular color
  // color: CommonStyles.actionColor,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
});

export const H4 = styled.Text({
  color: CommonStyles.textColor,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  fontWeight: '400',
  marginTop: UI_SIZES.spacing.big,
  paddingHorizontal: UI_SIZES.spacing.medium,
});

export const H1 = styled.Text({
  color: CommonStyles.primary,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 18,
  fontWeight: '600',
  marginBottom: UI_SIZES.spacing.big,
  marginTop: UI_SIZES.spacing.big,
});

export const ErrorMessage = styled.Text({
  alignSelf: 'center',
  color: CommonStyles.errorColor,
  flexGrow: 0,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  marginTop: UI_SIZES.spacing.medium,
  padding: UI_SIZES.spacing.tiny,
  textAlign: 'center',
});

export const InfoMessage = styled.Text({
  alignSelf: 'center',
  color: CommonStyles.textColor,
  flexGrow: 0,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  marginTop: UI_SIZES.spacing.medium,
  padding: UI_SIZES.spacing.tiny,
  textAlign: 'center',
});
