import { PixelRatio, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

const LOADER_HEIGHT = PixelRatio.getFontScale() * TextSizeStyle.Medium.lineHeight;

const LOADER_TITLE = {
  borderRadius: UI_SIZES.radius.medium,
  height: LOADER_HEIGHT,
};

export default StyleSheet.create({
  announcementTitle: {
    paddingBottom: UI_SIZES.spacing.minor,
  },
  emptyContent: {
    paddingHorizontal: UI_SIZES.spacing.big,
  },
  itemContainer: {
    backgroundColor: theme.ui.background.card,
    gap: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.big,
  },
  itemSeparator: {
    borderBottomColor: theme.palette.grey.cloudy,
    borderBottomWidth: UI_SIZES.border.normal,
  },
  loaderBanner: {
    borderBottomLeftRadius: UI_SIZES.radius.extraLarge,
    borderBottomRightRadius: UI_SIZES.radius.extraLarge,
    overflow: 'hidden',
    width: UI_SIZES.screen.width,
  },
  loaderPage: {
    gap: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.medium,
  },
  loaderSectionTitle: {
    ...LOADER_TITLE,
    width: '70%',
  },
  loaderSectionTitleShort: {
    ...LOADER_TITLE,
    width: '40%',
  },
  tiles: {
    gap: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.medium,
  },
  tilesCol: {
    flex: 1,
    gap: UI_SIZES.spacing.minor,
  },
  tilesRow: {
    flex: 1,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
  },
});
