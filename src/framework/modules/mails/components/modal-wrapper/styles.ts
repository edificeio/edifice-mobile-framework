import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  content: {
    backgroundColor: theme.palette.grey.white,
    borderTopLeftRadius: UI_SIZES.radius.mediumPlus,
    borderTopRightRadius: UI_SIZES.radius.mediumPlus,
    maxHeight: '90%',
    overflow: 'hidden',
    padding: UI_SIZES.spacing.medium,
    width: '100%',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: theme.ui.shadowColorTransparent,
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 0,
    position: 'relative',
  },
  touchableOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
