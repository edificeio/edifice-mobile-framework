import React from 'react';
import { PixelRatio, StyleSheet, TextProps, View, ViewStyle } from 'react-native';

import { UI_SIZES } from '../constants';
import { BodyBoldText, CaptionBoldText, SmallBoldText, TextSizeStyle } from '../text';
import { PillProps } from './types';

import theme from '~/app/theme';

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

export function Pill({ color, size = 'small', text }: Readonly<PillProps>) {
  const TextComponent = TextComponents[size];
  return (
    <View style={React.useMemo(() => [{ backgroundColor: color }, stylesBySize[size]], [color, size])}>
      <TextComponent style={styles.text}>{text}</TextComponent>
    </View>
  );
}
