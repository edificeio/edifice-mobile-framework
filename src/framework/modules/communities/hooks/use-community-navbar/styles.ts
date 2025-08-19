import { I18nManager, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  backButtonImage: {
    // custom iOS back button to ensure that perfect match with the native one
    height: 21, // value provided by react navigation
    marginRight: getScaleWidth(1), // Fix for the eye to visually center the rafter
    resizeMode: 'contain',
    tintColor: theme.ui.text.regular,
    transform: [{ scaleX: I18nManager.getConstants().isRTL ? -1 : 1 }],
    width: 13, // value provided by react navigation
  },
  navBarButton: {
    alignItems: 'center',
    backgroundColor: theme.ui.background.card,
    borderRadius: UI_SIZES.radius.medium,
    height: UI_SIZES.elements.icon.xlarge,
    justifyContent: 'center',
    left: -4, // compensate native placement of back icon. This value is not scaled by the UI.
    position: 'absolute',
    width: UI_SIZES.elements.icon.xlarge,
  },
  titleHeaderInner: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.elements.navbarIconSize + 2 * UI_SIZES.elements.navbarMargin,
    paddingTop: UI_SIZES.border.small,
  },
  titleHeaderWrapper: {
    alignItems: 'stretch',
    backgroundColor: theme.ui.background.card,
    borderBottomColor: theme.palette.grey.cloudy,
    borderBottomWidth: UI_SIZES.border.thin,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
