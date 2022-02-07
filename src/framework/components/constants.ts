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
  headerHeight: 56,
  tabsHeight: 56,
  screenHeight: screenDimensions.height,
  screenWidth: screenDimensions.width,
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
