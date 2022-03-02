import { Dimensions, Platform } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';

const screenDimensions = Dimensions.get('window');
const standardScreen = { height: 667, width: 375 }; // iPhone 8

const responsiveSpacing = (value: number) => Math.round((value * screenDimensions.width) / standardScreen.width);

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
  actionButtonSize: 20,
  bottomInset: initialWindowMetrics?.insets?.bottom || 0,
  dimensions: {
    height: {
      medium: 104,
    },
    width: {
      tiny: 1,
      small: 2,
    },
  },
  headerHeight: 56,
  radius: {
    small: 4,
    large: 21,
    extraLarge: 24,
  },
  screen: {
    height: screenDimensions.height,
    scale: screenDimensions.scale,
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
  tabsHeight: 56,
  topInset: initialWindowMetrics?.insets?.top || 0,
  getViewHeight: (parms: { isNavbar: boolean; isTabbar: boolean } = { isNavbar: true, isTabbar: true }) => {
    const { isNavbar, isTabbar } = parms;
    return (
      UI_SIZES.screen.height -
      (UI_SIZES.topInset ?? 0) -
      (UI_SIZES.bottomInset ?? 0) -
      (isNavbar ? UI_SIZES.headerHeight : 0) -
      (isTabbar ? UI_SIZES.tabsHeight : 0) +
      Platform.select({ ios: 4, default: 24 })
    );
  },
};

export const UI_VALUES = {
  modalOpacity: 0.4,
};
