import { Dimensions, Platform, StatusBar, TextStyle } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';

const screenDimensions = Dimensions.get('window');
const standardScreenDimensions = { height: 667, width: 375 }; // iPhone 8

const SCALE_DIMENSION_MAX = 1.5;
const SCALE_DIMENSION_MIN = 0.75;

const getScaleDimension = (dimension: number, type: 'height' | 'width' | 'font') =>
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
    useNativeDriver: true,
  },
  size: {
    duration: 300,
    useNativeDriver: false,
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
    actionButtonSize: 20,
    navbarHeight: 56,
    statusbarHeight: StatusBar.currentHeight,
    tabbarHeight: 56,
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
  },
  screen: {
    bottomInset: initialWindowMetrics?.insets?.bottom || 0,
    height: screenDimensions.height,
    scale: screenDimensions.scale,
    topInset: initialWindowMetrics?.insets?.top || 0,
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
  getResponsiveFontSize: (dimension: number) => getScaleDimension(dimension, 'font'),
  getResponsiveLineHeight: (dimension: number) => getScaleDimension(dimension + 6, 'font'),
  getResponsiveStyledLineHeight: (textStyle: TextStyle | undefined = undefined) =>
    getScaleDimension((textStyle?.fontSize || 14) + 6, 'height'),
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

export const UI_VALUES = {
  modalOpacity: 0.4,
};
