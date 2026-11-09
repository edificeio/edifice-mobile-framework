import { PixelRatio, StyleSheet, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

import { PillProps } from './types';

const DOT_SIZE = getScaleWidth(6);

export const ICON_SIZE_BY_SIZE: Record<NonNullable<PillProps['size']>, number> = {
  large: UI_SIZES.elements.icon.small,
  normal: UI_SIZES.elements.icon.xsmall,
  small: UI_SIZES.elements.icon.xxsmall,
};

export const stylesBySize: Record<NonNullable<PillProps['size']>, ViewStyle> = {
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

const styles = StyleSheet.create({
  container: {
    maxWidth: '100%',
  },
  containerRow: {
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
  textRow: {
    color: theme.ui.text.inverse,
    flexShrink: 1,
  },
});

export default styles;
