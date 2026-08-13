import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

import { ICON_WRAPPER_SIZE } from './constants';

export default StyleSheet.create({
  arc: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  card: {
    borderRadius: UI_SIZES.radius.extraLarge,
    borderWidth: UI_SIZES.border.small,
    elevation: 4,
    gap: UI_SIZES.spacing.minor,
    overflow: 'hidden',
    padding: UI_SIZES.spacing.small,
    paddingBottom: UI_SIZES.spacing.minor,
    shadowColor: theme.ui.shadowColor.toString(),
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    right: UI_SIZES.spacing.small,
    top: 0,
    zIndex: 2,
  },
  content: {
    flex: 1,
    gap: UI_SIZES.spacing.tiny,
  },
  contentWithClose: {
    paddingRight: UI_SIZES.elements.icon.default + UI_SIZES.spacing.minor,
  },
  footer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
    justifyContent: 'space-between',
    paddingLeft: ICON_WRAPPER_SIZE + UI_SIZES.spacing.small,
    zIndex: 1,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
    zIndex: 1,
  },
  iconWrapper: {
    alignItems: 'center',
    borderRadius: ICON_WRAPPER_SIZE / 2,
    height: ICON_WRAPPER_SIZE,
    justifyContent: 'center',
    padding: UI_SIZES.spacing.tiny,
    width: ICON_WRAPPER_SIZE,
  },
  measure: {
    left: 0,
    opacity: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  moreLessButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  previewBody: {
    color: theme.palette.grey.darkness.toString(),
  },
  signature: {
    color: theme.ui.text.regular.toString(),
    flexShrink: 1,
    maxWidth: '50%',
  },
  title: {
    color: theme.palette.grey.darkness.toString(),
  },
});
