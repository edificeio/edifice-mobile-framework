import { Dimensions, Platform } from "react-native";
import { initialWindowMetrics } from "react-native-safe-area-context";

const screenDimensions = Dimensions.get("window");

export const ANIMATION_CONFIGURATIONS_FADE = {
    duration: 300,
    useNativeDriver: true, 
};

export const ANIMATION_CONFIGURATIONS_SIZE = {
    duration: 300,
    useNativeDriver: false, 
};

export const UI_SIZES = {
    headerHeight: 56,
    tabsHeight: 56,
    screenHeight: screenDimensions.height,
    screenWidth: screenDimensions.width,
    topInset: initialWindowMetrics?.insets?.top,
    bottomInset: initialWindowMetrics?.insets?.bottom,
    getViewHeight: () => {
        return UI_SIZES.screenHeight
            - UI_SIZES.headerHeight
            - UI_SIZES.tabsHeight
            - (UI_SIZES.topInset ?? 0)
            - (UI_SIZES.bottomInset ?? 0)
            + Platform.select({ ios: 4, default: 24 });
    }
}
