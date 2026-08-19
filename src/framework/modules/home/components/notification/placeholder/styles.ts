import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { PLACEHOLDER_LINE_HEIGHT } from '~/framework/modules/home/components/constants';
import { MEDIA_GAP, MEDIA_HEIGHT } from '~/framework/modules/home/components/media-preview/constants';

const CHIP_HEIGHT = PLACEHOLDER_LINE_HEIGHT + 2 * UI_SIZES.spacing.tinyExtra;

export default StyleSheet.create({
  avatar: {
    marginBottom: 0,
  },
  card: {
    borderBottomColor: theme.palette.grey.cloudy.toString(),
    borderBottomWidth: UI_SIZES.border.thin,
    gap: UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.medium,
  },
  chip: {
    borderRadius: UI_SIZES.radius.huge,
    height: CHIP_HEIGHT,
    marginBottom: 0,
  },
  date: {
    height: getScaleWidth(18),
    marginBottom: 0,
  },
  header: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.medium,
  },
  lastLine: {
    height: PLACEHOLDER_LINE_HEIGHT,
    marginBottom: 0,
  },
  line: {
    height: PLACEHOLDER_LINE_HEIGHT,
    marginBottom: UI_SIZES.spacing.tiny,
  },
  media: {
    flexDirection: 'row',
    gap: MEDIA_GAP,
  },
  mediaItem: {
    borderRadius: UI_SIZES.radius.medium,
    flex: 1,
    height: MEDIA_HEIGHT,
    marginBottom: 0,
  },
  message: {
    flex: 1,
    gap: UI_SIZES.spacing.minor,
  },
  preview: {
    backgroundColor: theme.palette.grey.fog.toString(),
    marginVertical: UI_SIZES.spacing.minor,
  },
  previewIcon: {
    backgroundColor: theme.palette.grey.grey,
    borderRadius: UI_SIZES.radius.medium,
    marginBottom: 0,
  },
  previewLine: {
    height: PLACEHOLDER_LINE_HEIGHT,
    marginBottom: 0,
  },
  previewName: {
    backgroundColor: theme.palette.grey.cloudy,
    height: PLACEHOLDER_LINE_HEIGHT,
    marginBottom: 0,
  },
});
