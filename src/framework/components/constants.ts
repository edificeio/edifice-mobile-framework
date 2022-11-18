import { Dimensions, Platform, StatusBar, StyleSheet } from 'react-native';
import { hasNotch } from 'react-native-device-info';
import { initialWindowMetrics } from 'react-native-safe-area-context';

const screenDimensions = Dimensions.get('window');
const standardScreenDimensions = { height: 667, width: 375 }; // iPhone 8

const SCALE_DIMENSION_MAX = 1.5;
const SCALE_DIMENSION_MIN = 0.75;

export const getScaleDimension = (dimension: number, type: 'height' | 'font' | 'image' | 'width') =>
  Math.round(
    dimension *
      Math.max(
        Math.min(
          type === 'height'
            ? screenDimensions.height / standardScreenDimensions.height
            : screenDimensions.width / standardScreenDimensions.width,
          SCALE_DIMENSION_MAX,
        ),
        SCALE_DIMENSION_MIN,
      ),
  );

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
      largePlus: 36,
      huge: 38,
    },
  },
  elements: {
    actionButtonBorder: 2,
    logoSize: { height: getScaleDimension(64, 'height'), width: getScaleDimension(300, 'width') },
    navbarHeight: 56,
    statusbarHeight: StatusBar.currentHeight,
    tabbarHeight: 56,
    tabbarIconSize: 24,
    textFieldMaxHeight: 105,
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
      ios: initialWindowMetrics?.insets?.bottom || 0,
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
    _LEGACY_tiny: getScaleDimension(2, 'width'),
    tiny: getScaleDimension(4, 'width'),
    _LEGACY_small: getScaleDimension(6, 'width'),
    minor: getScaleDimension(8, 'width'),
    small: getScaleDimension(12, 'width'),
    medium: getScaleDimension(16, 'width'),
    big: getScaleDimension(24, 'width'),
    large: getScaleDimension(36, 'width'),
    major: getScaleDimension(48, 'width'),
    huge: getScaleDimension(64, 'width'),
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
  row: { flexDirection: 'row' },
  rowStretch: { flexDirection: 'row', alignItems: 'stretch', height: '100%' },
  flex1: { flex: 1 },
  flexGrow1: { flexGrow: 1 },
  flexShrink1: { flexShrink: 1 },
  justifyEnd: { justifyContent: 'flex-end' },
});

export const UI_VALUES = {
  modalOpacity: 0.4,
};
