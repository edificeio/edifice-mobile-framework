import { Dimensions, Insets, PixelRatio, Platform, StyleSheet } from 'react-native';

import DeviceInfo, { hasDynamicIsland, hasNotch } from 'react-native-device-info';
import { initialWindowMetrics } from 'react-native-safe-area-context';

const fallbackInsets = Platform.select({
  default: { bottom: 0, left: 0, right: 0, top: 0 },
  ios: { bottom: 34, left: 0, right: 0, top: hasDynamicIsland() ? 64 : hasNotch() ? 44 : 0 },
});

const insets = initialWindowMetrics?.insets || fallbackInsets;

const screenDimensions = Dimensions.get('window');
const standardScreenDimensions = { height: 667, width: 375 }; // iPhone 8

export const deviceFontScale = () => PixelRatio.getFontScale();

const SCALE_DIMENSION_MAX = 1.5;
const SCALE_DIMENSION_MIN = 0.75;

enum ScaleDimensionType {
  FONT,
  HEIGHT,
  IMAGE,
  WIDTH,
}

const getScaleDimension = (dimension: number, type: ScaleDimensionType) =>
  Math.round(
    dimension *
      Math.max(
        Math.min(
          type === ScaleDimensionType.HEIGHT
            ? screenDimensions.height / standardScreenDimensions.height
            : screenDimensions.width / standardScreenDimensions.width,
          SCALE_DIMENSION_MAX,
        ),
        SCALE_DIMENSION_MIN,
      ),
  );

export const getScaleFontSize = (size: number) => getScaleDimension(size, ScaleDimensionType.FONT);

export const getScaleHeight = (height: number) => getScaleDimension(height, ScaleDimensionType.HEIGHT);

export const getScaleImageSize = (size: number) => getScaleDimension(size, ScaleDimensionType.IMAGE);

export const getScaleWidth = (width: number) => getScaleDimension(width, ScaleDimensionType.WIDTH);

export const UI_ANIMATIONS = {
  fade: {
    duration: 300,
    useNativeDriver: false,
  },
  size: {
    duration: 300,
    useNativeDriver: false,
  },
  toast: {
    duration: 3000,
  },
  translate: {
    duration: 300,
    useNativeDriver: false,
  },
};

export const UI_SIZES = {
  aspectRatios: {
    square: 1,
    thumbnail: 7 / 5,
  },
  border: {
    normal: 3,
    small: 2,
    thin: 1,
  },
  cardSpacing: {
    major: getScaleWidth(40),
    small: getScaleWidth(10),
  },
  dimensions: {
    height: {
      hug: 32,
      huge: 38,
      large: 22,
      largePlus: 36,
      larger: 24,
      largerPlus: 28,
      medium: 18,
      mediumPlus: 20,
      small: 2,
      smallPlus: 16,
      tiny: 1,
    },
    width: {
      hug: 32,
      huge: 38,
      large: 22,
      largePlus: 36,
      larger: 24,
      medium: 18,
      mediumPlus: 20,
      small: 2,
      smallPlus: 16,
      tiny: 1,
    },
  },
  elements: {
    avatar: {
      lg: getScaleWidth(48),
      md: getScaleWidth(32),
      sm: getScaleWidth(24),
      xl: getScaleWidth(64),
      xxl: getScaleWidth(88),
    },
    border: {
      default: 2,
      large: 4,
      thin: 1,
    },
    editor: {
      toolbarHeight: getScaleWidth(20) + 2 * getScaleWidth(8) + getScaleWidth(4) * 2,
    },
    icon: {
      default: getScaleWidth(24),
      medium: getScaleWidth(22),
      small: getScaleWidth(20),
      xlarge: getScaleWidth(36),
      xsmall: getScaleWidth(16),
      xxlarge: getScaleWidth(64),
      xxsmall: getScaleWidth(12),
      xxxlarge: getScaleWidth(96),
    },
    image: {
      medium: getScaleImageSize(160),
      small: getScaleImageSize(64),
    },

    logoSize: { height: getScaleHeight(64), width: getScaleWidth(300) },

    navbarButtonSize: 32,
    /** @todo replace these constants by native ones. For the moment, use useHeaderHeight() instead if possible. */
    navbarHeight: Platform.select({ default: 56, ios: 44 }),
    navbarIconSize: 24,
    navbarMargin: 16,
    statusbarHeight: Platform.select({ default: 0, ios: 19 }),
    tabbarHeight: 56,
    tabbarIconSize: Platform.select({ default: 19, ios: 25 }),
    tabbarLabelMarginBottom: Platform.select({ default: 6, ios: insets.bottom ? 0 : 4 }),
    tabbarLabelMarginTop: Platform.select({ default: 8, ios: insets.bottom ? 0 : 4 }),
    textFieldMaxHeight: 105,
    thumbnail: getScaleImageSize(150),
  },
  getViewHeight: (parms: { withoutNavbar?: boolean; withoutTabbar?: boolean } = { withoutNavbar: true, withoutTabbar: true }) => {
    const { withoutNavbar, withoutTabbar } = parms;
    return (
      UI_SIZES.screen.height -
      UI_SIZES.screen.topInset -
      UI_SIZES.screen.bottomInset -
      (withoutNavbar ? UI_SIZES.elements.navbarHeight : 0) -
      (withoutTabbar ? UI_SIZES.elements.tabbarHeight : 0) +
      Platform.select({ default: 24, ios: 4 })
    );
  },
  radius: {
    big: getScaleWidth(32),
    card: getScaleWidth(8),
    extraLarge: getScaleWidth(24),
    huge: getScaleWidth(48),
    input: getScaleWidth(12),
    large: getScaleWidth(21),
    medium: getScaleWidth(8),
    mediumPlus: getScaleWidth(16),
    newCard: getScaleWidth(12),
    selector: getScaleWidth(12),
    small: getScaleWidth(4),
  },
  screen: {
    bottomInset: Platform.select({
      default: 0,
      ios: DeviceInfo.isTablet() ? 32 : insets.bottom,
    }),
    height: screenDimensions.height,
    scale: screenDimensions.scale,
    topInset: Platform.select({
      default: hasNotch() ? insets.top : 0,
      ios: insets.top,
    }),
    width: screenDimensions.width,
  },
  spacing: {
    _LEGACY_small: getScaleWidth(6),
    _LEGACY_tiny: getScaleWidth(2),
    big: getScaleWidth(24),
    huge: getScaleWidth(64),
    large: getScaleWidth(32),
    major: getScaleWidth(48),
    medium: getScaleWidth(16),
    minor: getScaleWidth(8),
    small: getScaleWidth(12),
    tiny: getScaleWidth(4),
    tinyExtra: getScaleWidth(2),
  },
  standardScreen: standardScreenDimensions,
};

export const UI_STYLES = StyleSheet.create({
  clickZone: { minHeight: 48, minWidth: 48 },
  flex0: { flex: 0 },
  flex1: { flex: 1 },
  flexGrow1: { flexGrow: 1 },
  flexShrink1: { flexShrink: 1 },
  justifyEnd: { justifyContent: 'flex-end' },
  row: { flexDirection: 'row' },
  rowStretch: { alignItems: 'stretch', flexDirection: 'row', height: '100%' },
  width100: { width: '100%' },
});

export const UI_VALUES = {
  opacity: {
    explorer: 0.1,
    half: 0.5,
    modal: 0.4,
    opaque: 1,
    transparent: 0,
  },
};

export const genericHitSlop: Insets = {
  bottom: UI_SIZES.spacing.minor,
  left: UI_SIZES.spacing.minor,
  right: UI_SIZES.spacing.minor,
  top: UI_SIZES.spacing.minor,
};
