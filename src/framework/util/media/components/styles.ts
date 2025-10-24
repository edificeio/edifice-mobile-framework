import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  grid: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.minor / 2,
  },
  iconCard: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.medium,
    flex: 1,
    justifyContent: 'center',
  },
  item: {
    flexBasis: '50%',
    flexGrow: 1,
    flexShrink: 1,
    padding: UI_SIZES.spacing.minor / 2,
  },
  mediaCard: {
    gap: UI_SIZES.spacing.tiny,
  },
  mediaImageCard: {
    backgroundColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.medium,
    height: '100%',
    width: '100%',
  },
  mediaVideoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: theme.ui.overlay.light,
    borderRadius: UI_SIZES.radius.medium,
    justifyContent: 'center',
    margin: UI_SIZES.spacing.minor / 2,
  },
  titleCard: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.medium,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.tiny,
    minHeight: UI_SIZES.elements.icon.small + 2 * UI_SIZES.spacing.minor + 2 * UI_SIZES.spacing.tiny,
    padding: UI_SIZES.spacing.tiny,
  },
  titleIcon: {
    padding: UI_SIZES.spacing.minor,
  },
  titleText: {
    paddingHorizontal: UI_SIZES.spacing.minor,
  },
});
