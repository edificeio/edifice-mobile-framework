import { PixelRatio, StyleSheet } from 'react-native';

import { TextFontStyle, TextSizeStyle } from '../text';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  commentContent: {
    backgroundColor: theme.palette.grey.fog,
    borderRadius: UI_SIZES.radius.medium,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  commentContentDeleted: {
    borderColor: theme.palette.grey.cloudy,
    borderWidth: UI_SIZES.border.small,
  },
  commentForm: {
    alignItems: 'flex-end',
    flex: 0,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    margin: UI_SIZES.spacing.minor,
  },
  commentTextInput: {
    flex: 0,
    fontSize: TextSizeStyle.Small.fontSize,
    lineHeight: TextSizeStyle.Small.lineHeight,
    paddingHorizontal: UI_SIZES.spacing.small,
    // paddingVertical:
    //   (UI_SIZES.elements.avatar.md - 2 * UI_SIZES.border.thin - PixelRatio.getFontScale() * TextSizeStyle.Small.lineHeight) / 2,
    ...TextFontStyle.Regular,
  },
  commentTextInputPlaceholder: {
    color: theme.palette.grey.graphite,
    marginHorizontal: UI_SIZES.spacing.small,
    // marginVertical: Math.max(
    //   (UI_SIZES.elements.avatar.md - 2 * UI_SIZES.border.thin - PixelRatio.getFontScale() * TextSizeStyle.Small.lineHeight) / 2,
    //   0,
    // ),
    pointerEvents: 'none',
    position: 'absolute',
    verticalAlign: 'middle',
  },
  commentTextInputWrapper: {
    backgroundColor: theme.palette.grey.fog,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.border.thin,
    overflow: 'hidden',
  },
  commentTextShadow: {
    ...StyleSheet.absoluteFillObject,
    borderColor: theme.palette.grey.fog,
    borderRadius: UI_SIZES.radius.mediumPlus - 2,
    borderWidth: 1,
    pointerEvents: 'none',
  },
});
