import { StyleSheet } from 'react-native';

import { defaultTheme } from '~/app/theme';
import { getScaleFontSize, getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  buttonGradient: {
    height: '100%',
    left: -getScaleWidth(64),
    position: 'absolute',
    top: 0,
    width: getScaleWidth(64),
  },
  closeButton: {
    padding: UI_SIZES.spacing.minor,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  contentWrapper: {
    borderBottomLeftRadius: UI_SIZES.radius.small,
    borderBottomRightRadius: UI_SIZES.radius.medium,
    borderTopLeftRadius: UI_SIZES.radius.medium,
    borderTopRightRadius: UI_SIZES.radius.medium,
    paddingBottom: getScaleWidth(24),
    paddingHorizontal: getScaleWidth(24),
    paddingTop: getScaleWidth(36),
  },
  iconShadow: {
    borderRadius: getScaleWidth(52) / 2,
    height: getScaleWidth(52),
    left: getScaleWidth(24),
    padding: UI_SIZES.spacing.tiny,
    position: 'absolute',
    top: -getScaleWidth(20),
    width: getScaleWidth(52),
  },
  iconWrapper: {
    alignItems: 'center',
    borderRadius: (getScaleWidth(52) - 2 * UI_SIZES.spacing.tiny) / 2,
    borderWidth: getScaleWidth(4),
    height: getScaleWidth(52) - 2 * UI_SIZES.spacing.tiny,
    justifyContent: 'center',
    width: getScaleWidth(52) - 2 * UI_SIZES.spacing.tiny,
  },
  moreButtonWrapper: {
    bottom: getScaleWidth(24),
    position: 'absolute',
    right: getScaleWidth(24),
  },
  moreLessButton: {
    alignSelf: 'flex-end',
    flex: 0,
    paddingVertical: 0,
  },
  postContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: UI_SIZES.spacing.medium
  },
  shadowWrapper: {
    borderRadius: UI_SIZES.radius.medium,
    marginBottom: UI_SIZES.spacing.medium,
    marginHorizontal: UI_SIZES.spacing.medium,
    marginTop: UI_SIZES.spacing.minor,
    paddingBottom: UI_SIZES.spacing.tiny,
    paddingLeft: UI_SIZES.spacing.tiny,
  },
  signature: {
    color: defaultTheme.palette.grey.graphite,
    flex: 1,
    marginTop: getScaleFontSize(22),
  },
  unexpanded: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
