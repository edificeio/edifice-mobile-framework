import { Dimensions, Platform, StatusBar } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';

const screenDimensions = Dimensions.get('window');
const standardScreen = { height: 667, width: 375 }; // iPhone 8
const responsiveSpacing = (value: number) => Math.max(Math.round((value * screenDimensions.width) / standardScreen.width), 1.25);

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
    },
    width: {
      tiny: 1,
      small: 2,
      medium: 18,
    },
  },
  elements: {
    actionButtonSize: 20,
    navbarHeight: 56,
    statusbarHeight: StatusBar.currentHeight,
    tabbarHeight: 56,
  },
  radius: {
    small: 4,
    medium: 8,
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
    tiny: responsiveSpacing(2),
    extraSmall: responsiveSpacing(4),
    small: responsiveSpacing(6),
    smallPlus: responsiveSpacing(8),
    medium: responsiveSpacing(12),
    mediumPlus: responsiveSpacing(14),
    large: responsiveSpacing(16),
    largePlus: responsiveSpacing(22),
    extraLarge: responsiveSpacing(24),
    extraLargePlus: responsiveSpacing(36),
    huge: responsiveSpacing(64),
  },
  standardScreen,
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
