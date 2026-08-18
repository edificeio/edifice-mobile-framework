import React from 'react';
import { PixelRatio, StyleSheet, TextProps, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import {
  BodyBoldText,
  BodyItalicText,
  CaptionBoldText,
  CaptionItalicText,
  SmallBoldText,
  SmallItalicText,
  TextSizeStyle,
} from '~/framework/components/text';

import { PillProps } from './types';

const styles = StyleSheet.create({
  text: {
    color: theme.ui.text.inverse,
    margin: 'auto',
  },
});

const TextComponents: Record<NonNullable<PillProps['size']>, React.ComponentType<TextProps>> = {
  large: BodyBoldText,
  normal: SmallBoldText,
  small: CaptionBoldText,
};

const ItalicTextComponents: Record<NonNullable<PillProps['size']>, React.ComponentType<TextProps>> = {
  large: BodyItalicText,
  normal: SmallItalicText,
  small: CaptionItalicText,
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

export function Pill({ color, italic, size = 'small', text, textColor }: Readonly<PillProps>) {
  const TextComponent = italic ? ItalicTextComponents[size] : TextComponents[size];
  const textStyle = React.useMemo(() => [styles.text, { color: textColor ?? theme.ui.text.inverse }], [textColor]);

  return (
    <View style={React.useMemo(() => [{ backgroundColor: color }, stylesBySize[size]], [color, size])}>
      <TextComponent style={textStyle}>{text}</TextComponent>
    </View>
  );
}
