import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, UI_VALUES } from '~/framework/components/constants';
import { TextFontStyle, TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  captionBoldText: { ...TextFontStyle.Bold, fontSize: TextSizeStyle.Small.fontSize, color: theme.ui.text.light },
  captionText: { ...TextFontStyle.Regular, fontSize: TextSizeStyle.Small.fontSize, color: theme.ui.text.light },
  commonItemTouchableStyle: {
    flex: 1,
    marginHorizontal: UI_SIZES.spacing.small,
    marginVertical: UI_SIZES.spacing.small,
    borderRadius: UI_SIZES.radius.mediumPlus,
  },
  custom: { opacity: UI_VALUES.opacity.explorer, position: 'absolute', width: '100%', height: '100%' },
  empyItemTouchableStyle: { opacity: UI_VALUES.opacity.transparent },
  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderTopLeftRadius: UI_SIZES.radius.mediumPlus,
    borderTopRightRadius: UI_SIZES.radius.mediumPlus,
  },
  item: { backgroundColor: theme.ui.background.card, borderRadius: UI_SIZES.radius.mediumPlus },
  itemText: { textAlign: 'center' },
  itemTouchableStyle: { borderWidth: UI_SIZES.border.thin, borderColor: theme.ui.border.input },
  metadata: { paddingVertical: UI_SIZES.spacing._LEGACY_small, paddingHorizontal: UI_SIZES.spacing.minor },
  smallText: { ...TextFontStyle.Regular, fontSize: TextSizeStyle.Normal.fontSize },
  textContainer: { position: 'absolute', width: '100%' },
  thumbnail: {
    aspectRatio: UI_SIZES.aspectRatios.thumbnail,
    borderTopLeftRadius: UI_SIZES.radius.mediumPlus,
    borderTopRightRadius: UI_SIZES.radius.mediumPlus,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
