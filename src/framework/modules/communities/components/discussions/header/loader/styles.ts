import { PixelRatio, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';
import {
  BIG_BOTTOM_RESERVE,
  ICON_LEFT,
  ICON_OVERFLOW,
  TEXT_LEFT_BIG,
} from '~/framework/modules/communities/components/discussions/header/styles';

const LOADER_FONT_SCALE = PixelRatio.getFontScale();
const LOADER_AUTHOR_HEIGHT = TextSizeStyle.Normal.lineHeight * LOADER_FONT_SCALE;
const LOADER_DATE_HEIGHT = TextSizeStyle.Small.lineHeight * LOADER_FONT_SCALE;
const LOADER_TITLE_HEIGHT = TextSizeStyle.Big.lineHeight * LOADER_FONT_SCALE;

export default StyleSheet.create({
  loaderAuthor: {
    borderRadius: UI_SIZES.radius.card,
    height: TextSizeStyle.Normal.fontSize * LOADER_FONT_SCALE,
  },
  loaderAuthorAndDateColumn: {
    bottom: -ICON_OVERFLOW,
    gap: UI_SIZES.spacing.tinyExtra,
    left: TEXT_LEFT_BIG,
    position: 'absolute',
    right: UI_SIZES.spacing.big,
  },
  loaderAuthorLineBox: {
    height: LOADER_AUTHOR_HEIGHT,
    justifyContent: 'center',
  },
  loaderBand: {
    backgroundColor: theme.palette.grey.fog,
    borderTopColor: theme.palette.grey.cloudy,
    borderTopWidth: UI_SIZES.border.thin,
    paddingBottom: BIG_BOTTOM_RESERVE,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.medium,
  },
  loaderDate: {
    borderRadius: UI_SIZES.radius.card,
    height: TextSizeStyle.Small.fontSize * LOADER_FONT_SCALE,
  },
  loaderDateLineBox: {
    height: LOADER_DATE_HEIGHT,
    justifyContent: 'center',
  },
  loaderIcon: {
    borderColor: theme.palette.grey.fog,
    borderRadius: UI_SIZES.radius.newCard,
    borderWidth: UI_SIZES.border.small,
    bottom: -ICON_OVERFLOW,
    left: ICON_LEFT,
    position: 'absolute',
  },
  loaderRoot: {
    zIndex: 1,
  },
  loaderTitle: {
    borderRadius: UI_SIZES.radius.card,
    height: LOADER_TITLE_HEIGHT,
  },
  loaderTitleLines: {
    gap: UI_SIZES.spacing.tiny,
  },
});
