import { Dimensions, Platform, StatusBar, TextStyle } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';

const screenDimensions = Dimensions.get('window');
const standardScreenDimensions = { height: 667, width: 375 }; // iPhone 8

const getScaleDimension = (dimension: number, type: 'height' | 'width' | 'font') =>
  Math.round(
    dimension *
      Math.min(
        type === 'height'
          ? screenDimensions.height / standardScreenDimensions.height
          : screenDimensions.width / standardScreenDimensions.width,
        1.75,
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
    card: 15 / 14,
    thumbnail: 7 / 5,
  },
  dimensions: {
    height: {
      medium: 18,
      large: 22,
      largePlus: 38,
    },
    width: {
      tiny: 1,
      small: 2,
      medium: 18,
      large: 22,
      largePlus: 38,
    },
  },
  elements: {
    actionButtonSize: 20,
    navbarHeight: 56,
    statusbarHeight: StatusBar.currentHeight,
    tabbarHeight: 56,
  },
  radius: {
    medium: 8,
    large: 21,
    extraLarge: 24,
    small: 4,
  },
  screen: {
    bottomInset: initialWindowMetrics?.insets?.bottom || 0,
    height: screenDimensions.height,
    scale: screenDimensions.scale,
    topInset: initialWindowMetrics?.insets?.top || 0,
    width: screenDimensions.width,
  },
  spacing: {
    tiny: getScaleDimension(2, 'width'),
    extraSmall: getScaleDimension(4, 'width'),
    small: getScaleDimension(6, 'width'),
    smallPlus: getScaleDimension(8, 'width'),
    medium: getScaleDimension(12, 'width'),
    mediumPlus: getScaleDimension(14, 'width'),
    large: getScaleDimension(16, 'width'),
    largePlus: getScaleDimension(22, 'width'),
    extraLarge: getScaleDimension(24, 'width'),
    extraLargePlus: getScaleDimension(36, 'width'),
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
