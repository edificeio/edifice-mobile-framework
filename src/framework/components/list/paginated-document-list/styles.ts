import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  documentImage: {
    height: '100%',
    width: '100%',
  },
  documentLargeIconMediaWrapper: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.elements.icon.xxlarge / 2,
    height: UI_SIZES.elements.icon.xxlarge,
    justifyContent: 'center',
    width: UI_SIZES.elements.icon.xxlarge,
  },
  documentMetadata: { gap: UI_SIZES.spacing.tiny, padding: UI_SIZES.spacing.small },
  documentMetadataDate: { color: theme.palette.grey.graphite, height: TextSizeStyle.Small.lineHeight },
  documentMetadataTitle: { height: TextSizeStyle.Medium.lineHeight },
  documentThumbnail: {
    alignItems: 'center',
    aspectRatio: UI_SIZES.aspectRatios.thumbnail,
    justifyContent: 'center',
  },
  documentThumbnailFloatingIconWrapper: {
    backgroundColor: theme.palette.grey.white,
    borderBottomLeftRadius: UI_SIZES.radius.mediumPlus,
    borderBottomWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.grey.cloudy,
    borderLeftWidth: UI_SIZES.border.thin,
    padding: UI_SIZES.spacing.minor,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  documentThumbnailPlaceholder: {
    aspectRatio: UI_SIZES.aspectRatios.thumbnail,
    height: 'auto',
    width: '100%',
  },
  item: {
    alignItems: 'stretch',
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.border.thin,
    flex: 1,
    margin: UI_SIZES.spacing.big / 2,
    overflow: 'hidden',
  },
  itemDocument: {
    flexDirection: 'column',
  },
  itemFolder: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
  itemPlaceholder: {
    pointerEvents: 'none',
  },
  itemSpacer: {
    opacity: 0,
    pointerEvents: 'none',
  },
  list: {
    padding: UI_SIZES.spacing.big / 2,
  },
});
