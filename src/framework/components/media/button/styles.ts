import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleHeight, UI_SIZES } from '~/framework/components/constants';

const sizeIconAudio = getScaleHeight(36);
const gradientBlack = 'rgba(0,0,0,.3)';
const heightPreviewVideo = (10 / 16) * (UI_SIZES.screen.width - UI_SIZES.spacing.medium * 4);

export default StyleSheet.create({
  absolute: {
    position: 'absolute',
  },
  iconAudio: {
    height: sizeIconAudio,
    marginRight: UI_SIZES.spacing.small,
    position: 'relative',
    width: sizeIconAudio,
  },
  player: {
    maxHeight: '100%',
    width: '100%',
  },
  previewAudio: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.fog,
    borderColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.huge,
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    padding: UI_SIZES.spacing.small,
  },
  previewVideo: {
    alignItems: 'center',
    backgroundColor: theme.ui.shadowColor,
    borderRadius: UI_SIZES.radius.card,
    height: heightPreviewVideo,
    justifyContent: 'center',
    maxHeight: heightPreviewVideo,
  },
  viewVideo: {
    alignItems: 'center',
    backgroundColor: gradientBlack,
    borderRadius: UI_SIZES.radius.card,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
