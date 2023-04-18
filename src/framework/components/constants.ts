import { Dimensions, Insets, Platform, StyleSheet } from 'react-native';
import DeviceInfo, { hasNotch } from 'react-native-device-info';
import { initialWindowMetrics } from 'react-native-safe-area-context';

const screenDimensions = Dimensions.get('window');
const standardScreenDimensions = { height: 667, width: 375 }; // iPhone 8

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
};

export const UI_SIZES = {
  aspectRatios: {
    thumbnail: 7 / 5,
  },
  dimensions: {
    height: {
      tiny: 1,
      small: 2,
      medium: 18,
      mediumPlus: 20,
      large: 22,
      larger: 24,
      largerPlus: 28,
      hug: 32,
      largePlus: 36,
      huge: 38,
    },
    width: {
      tiny: 1,
      small: 2,
      medium: 18,
      mediumPlus: 20,
      large: 22,
      larger: 24,
      hug: 32,
      largePlus: 36,
      huge: 38,
    },
  },
  elements: {
    actionButtonBorder: 2,
    icon: 24,
    logoSize: { height: getScaleHeight(64), width: getScaleWidth(300) },
    /** @deprecated use useHeaderHeight() instead */
    navbarHeight: 56,
    navbarButtonSize: 32,
    navbarIconSize: 24,
    navbarMargin: 16,
    statusbarHeight: Platform.select({ ios: 19, default: 0 }),
    tabbarHeight: 56,
    tabbarIconSize: Platform.select({ ios: 25, default: 19 }),
    tabbarLabelMargin: Platform.select({ ios: initialWindowMetrics?.insets?.bottom ? 0 : 4, default: 8 }),
    textFieldMaxHeight: 105,
    thumbnail: getScaleImageSize(150),
  },
  radius: {
    small: 4,
    medium: 8,
    card: 8,
    explorer: 18,
    mediumPlus: 16,
    large: 21,
    extraLarge: 24,
    huge: 48,
  },
  screen: {
    bottomInset: Platform.select({
      ios: DeviceInfo.isTablet() ? 32 : initialWindowMetrics?.insets?.bottom || 0,
      default: 0,
    }),
    height: screenDimensions.height,
    scale: screenDimensions.scale,
    topInset: Platform.select({
      ios: initialWindowMetrics?.insets?.top || 0,
      default: hasNotch() ? initialWindowMetrics?.insets?.top || 0 : 0,
    }),
    width: screenDimensions.width,
  },
  spacing: {
    _LEGACY_tiny: getScaleWidth(2),
    tiny: getScaleWidth(4),
    _LEGACY_small: getScaleWidth(6),
    minor: getScaleWidth(8),
    small: getScaleWidth(12),
    medium: getScaleWidth(16),
    big: getScaleWidth(24),
    large: getScaleWidth(36),
    major: getScaleWidth(48),
    huge: getScaleWidth(64),
  },
  standardScreen: standardScreenDimensions,
  getViewHeight: (parms: { isNavbar: boolean; isTabbar: boolean } = { isNavbar: true, isTabbar: true }) => {
    const { isNavbar, isTabbar } = parms;
    return (
      UI_SIZES.screen.height -
      UI_SIZES.screen.topInset -
      UI_SIZES.screen.bottomInset -
      (isNavbar ? UI_SIZES.elements.navbarHeight : 0) -
      (isTabbar ? UI_SIZES.elements.tabbarHeight : 0) +
      Platform.select({ ios: 4, default: 24 })
    );
  },
};

export const UI_STYLES = StyleSheet.create({
  clickZone: { minHeight: 48, minWidth: 48 },
  flex1: { flex: 1 },
  flex0: { flex: 0 },
  flexGrow1: { flexGrow: 1 },
  flexShrink1: { flexShrink: 1 },
  justifyEnd: { justifyContent: 'flex-end' },
  row: { flexDirection: 'row' },
  rowStretch: { flexDirection: 'row', alignItems: 'stretch', height: '100%' },
  width100: { width: '100%' },
});

export const UI_VALUES = {
  modalOpacity: 0.4,
  opacity: {
    half: 0.5,
    modal: 0.4,
    opaque: 1,
    transparent: 0,
  },
};

export const genericHitSlop: Insets = {
  top: UI_SIZES.spacing.minor,
  bottom: UI_SIZES.spacing.minor,
  left: UI_SIZES.spacing.minor,
  right: UI_SIZES.spacing.minor,
};
