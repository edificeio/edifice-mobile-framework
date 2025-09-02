import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  content: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.mediumPlus,
    maxHeight: '80%',
    overflow: 'hidden',
    paddingVertical: UI_SIZES.spacing.small,
    width: '100%',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: theme.ui.shadowColorTransparent,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.big,
    position: 'relative',
  },
  touchableOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
