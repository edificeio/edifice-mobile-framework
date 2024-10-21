import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, UI_VALUES } from '~/framework/components/constants';
import { TextFontStyle, TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  captionBoldText: { ...TextFontStyle.Bold, color: theme.ui.text.light, fontSize: TextSizeStyle.Small.fontSize },
  captionText: { ...TextFontStyle.Regular, color: theme.ui.text.light, fontSize: TextSizeStyle.Small.fontSize },
  commonItemTouchableStyle: {
    borderRadius: UI_SIZES.radius.mediumPlus,
    flex: 1,
    marginHorizontal: UI_SIZES.spacing.small,
    marginVertical: UI_SIZES.spacing.small,
  },
  custom: { height: '100%', opacity: UI_VALUES.opacity.explorer, position: 'absolute', width: '100%' },
  empyItemTouchableStyle: { opacity: UI_VALUES.opacity.transparent },
  image: {
    backgroundColor: theme.palette.grey.white,
    borderTopLeftRadius: UI_SIZES.radius.mediumPlus,
    borderTopRightRadius: UI_SIZES.radius.mediumPlus,
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  item: { backgroundColor: theme.ui.background.card, borderRadius: UI_SIZES.radius.mediumPlus },
  itemText: { textAlign: 'center' },
  itemTouchableStyle: { borderColor: theme.ui.border.input, borderWidth: UI_SIZES.border.thin },
  metadata: { paddingHorizontal: UI_SIZES.spacing.minor, paddingVertical: UI_SIZES.spacing._LEGACY_small },
  smallText: { ...TextFontStyle.Regular, fontSize: TextSizeStyle.Normal.fontSize },
  textContainer: { position: 'absolute', width: '100%' },
  thumbnail: {
    alignItems: 'center',
    aspectRatio: UI_SIZES.aspectRatios.thumbnail,
    borderTopLeftRadius: UI_SIZES.radius.mediumPlus,
    borderTopRightRadius: UI_SIZES.radius.mediumPlus,
    justifyContent: 'center',
  },
});
