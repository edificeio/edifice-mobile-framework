import { PixelRatio, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  contentContainer: {
    padding: UI_SIZES.spacing.big / 2,
  },
  folderItem: {
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.input,
    borderWidth: UI_SIZES.border.thin,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
  folderLabel: {
    color: theme.palette.grey.black,
    lineHeight: TextSizeStyle.Small.lineHeight,
  },
  folderLabelContainer: {
    flex: 1,
    marginLeft: UI_SIZES.spacing.minor,
  },
  folderThumbnail: {
    flexDirection: 'row',
  },
  grid: {
    backgroundColor: theme.palette.complementary.orange.pale,
    borderColor: theme.ui.text.regular,
    borderWidth: 2,
  },
  item: {
    borderRadius: UI_SIZES.radius.mediumPlus,
    flex: 1,
    margin: UI_SIZES.spacing.big / 2,
    overflow: 'hidden',
  },
  itemThumbnail: {
    aspectRatio: UI_SIZES.aspectRatios.thumbnail,
    borderRadius: 0,
  },
  itemThumbnailPlaceholder: {
    aspectRatio: UI_SIZES.aspectRatios.thumbnail,
    borderRadius: 0,
    height: undefined,
    width: '100%',
  },
  labelCaption: {
    color: theme.palette.grey.graphite,
    lineHeight: TextSizeStyle.Small.lineHeight,
  },
  labelContainer: {
    flexDirection: 'column',
    height: 2 * TextSizeStyle.Small.lineHeight + UI_SIZES.spacing.minor + (UI_SIZES.spacing.small + UI_SIZES.spacing.minor) / 2,
    justifyContent: 'center',
    paddingBottom: (UI_SIZES.spacing.small + UI_SIZES.spacing.minor) / 2,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingTop: UI_SIZES.spacing.minor,
  },
  labelContainerPlaceholder: {
    flexDirection: 'column',
    height: 2 * TextSizeStyle.Small.lineHeight * PixelRatio.getFontScale() + UI_SIZES.spacing.minor + UI_SIZES.spacing.small,
    justifyContent: 'space-around',
    paddingBottom: UI_SIZES.spacing.small,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingTop: UI_SIZES.spacing.minor,
  },
  resourceItem: {
    backgroundColor: theme.ui.background.card,
    borderColor: theme.palette.grey.cloudy,
    borderWidth: UI_SIZES.border.thin,
  },
  spacerFolder: {
    opacity: 0,
  },
});
