import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleHeight } from '~/framework/components/constants';

const sizeIconAudio = getScaleHeight(36);
const gradientBlack = 'rgba(0,0,0,.3)';
const heightPreviewVideo = 0.25 * UI_SIZES.screen.height;

export default StyleSheet.create({
  absolute: {
    position: 'absolute',
  },
  iconAudio: {
    position: 'relative',
    height: sizeIconAudio,
    width: sizeIconAudio,
  },
  player: {
    width: '100%',
    maxHeight: '100%',
  },
  previewAudio: {
    padding: UI_SIZES.spacing.small,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: UI_SIZES.radius.huge,
    borderColor: theme.palette.grey.pearl,
    backgroundColor: theme.palette.grey.fog,
  },
  previewVideo: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.ui.shadowColor,
    borderRadius: UI_SIZES.radius.card,
    height: heightPreviewVideo,
    maxHeight: heightPreviewVideo,
  },
  viewVideo: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: gradientBlack,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: UI_SIZES.radius.card,
  },
});
