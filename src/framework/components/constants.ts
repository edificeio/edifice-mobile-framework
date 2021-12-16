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
  bottomInset: initialWindowMetrics?.insets?.bottom,
  headerHeight: 56,
  modalOpacity: 0.4,
  tabsHeight: 56,
  screenHeight: screenDimensions.height,
  screenWidth: screenDimensions.width,
  topInset: initialWindowMetrics?.insets?.top,
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
