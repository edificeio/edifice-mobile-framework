import React from 'react';
import { PixelRatio, StyleSheet, TextProps, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import {
  BodyBoldText,
  BodyItalicText,
  BodyText,
  CaptionBoldText,
  CaptionItalicText,
  CaptionText,
  SmallBoldText,
  SmallItalicText,
  SmallText,
  TextSizeStyle,
} from '~/framework/components/text';

import { PillProps } from './types';

const DOT_SIZE = getScaleWidth(6);

const styles = StyleSheet.create({
  container: {
    maxWidth: '100%',
  },
  containerWithDot: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.tiny,
    justifyContent: 'center',
  },
  dot: {
    borderRadius: DOT_SIZE / 2,
    height: DOT_SIZE,
    width: DOT_SIZE,
  },
  text: {
    color: theme.ui.text.inverse,
    margin: 'auto',
  },
  textWithDot: {
    color: theme.ui.text.inverse,
    flexShrink: 1,
  },
});

const BoldTextComponents: Record<NonNullable<PillProps['size']>, React.ComponentType<TextProps>> = {
  large: BodyBoldText,
  normal: SmallBoldText,
  small: CaptionBoldText,
};

const ItalicTextComponents: Record<NonNullable<PillProps['size']>, React.ComponentType<TextProps>> = {
  large: BodyItalicText,
  normal: SmallItalicText,
  small: CaptionItalicText,
};

const RegularTextComponents: Record<NonNullable<PillProps['size']>, React.ComponentType<TextProps>> = {
  large: BodyText,
  normal: SmallText,
  small: CaptionText,
};

const stylesBySize: Record<NonNullable<PillProps['size']>, ViewStyle> = {
  large: {
    borderRadius: (PixelRatio.getFontScale() * TextSizeStyle.Medium.lineHeight + UI_SIZES.spacing.tiny * 2) / 2,
    height: PixelRatio.getFontScale() * TextSizeStyle.Medium.lineHeight + UI_SIZES.spacing.tiny * 2,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  normal: {
    borderRadius: (PixelRatio.getFontScale() * TextSizeStyle.Normal.lineHeight + UI_SIZES.spacing.tiny) / 2,
    height: PixelRatio.getFontScale() * TextSizeStyle.Normal.lineHeight + UI_SIZES.spacing.tiny,
    paddingHorizontal: UI_SIZES.spacing.small,
  },
  small: {
    borderRadius: (PixelRatio.getFontScale() * TextSizeStyle.Small.lineHeight + UI_SIZES.spacing.tiny / 2) / 2,
    height: PixelRatio.getFontScale() * TextSizeStyle.Small.lineHeight + UI_SIZES.spacing.tiny / 2,
    paddingHorizontal: UI_SIZES.spacing.minor,
  },
};

export function Pill({ bold, color, dot, italic, size = 'small', text, textColor }: Readonly<PillProps>) {
  const TextComponent = italic ? ItalicTextComponents[size] : bold ? BoldTextComponents[size] : RegularTextComponents[size];
  const textStyle = React.useMemo(
    () => [dot ? styles.textWithDot : styles.text, { color: textColor ?? theme.ui.text.inverse }],
    [dot, textColor],
  );
  const containerStyle = React.useMemo(
    () => [{ backgroundColor: color }, stylesBySize[size], styles.container, dot ? styles.containerWithDot : undefined],
    [color, dot, size],
  );
  const dotStyle = React.useMemo(() => [styles.dot, { backgroundColor: dot }], [dot]);

  return (
    <View style={containerStyle}>
      <TextComponent numberOfLines={1} style={textStyle}>
        {text}
      </TextComponent>
      {dot ? <View style={dotStyle} /> : null}
    </View>
  );
}
