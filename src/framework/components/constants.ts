import { Dimensions, Platform } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';

const screenDimensions = Dimensions.get('window');

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
  screenHeight: screenDimensions.height,
  screenWidth: screenDimensions.width,
  spacing: {
    tiny: 2,
    extraSmall: 4,
    small: 6,
    smallPlus: 8,
    medium: 12,
    mediumPlus: 14,
    large: 16,
    largePlus: 22,
    extraLarge: 24,
    extraLargePlus: 36,
    huge: 64,
  },
  tabsHeight: 56,
  topInset: initialWindowMetrics?.insets?.top || 0,
  getViewHeight: (parms: { isNavbar: boolean; isTabbar: boolean } = { isNavbar: true, isTabbar: true }) => {
    const { isNavbar, isTabbar } = parms;
    return (
      UI_SIZES.screenHeight -
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
