import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  space: {
    marginHorizontal: UI_SIZES.spacing.medium,
    backgroundColor: '#1C1C73',
    marginBottom: UI_SIZES.spacing.medium,
    borderRadius: UI_SIZES.radius.mediumPlus,
    padding: UI_SIZES.spacing.medium,
  },
  spaceAnim: {
    width: 100,
    height: 100,
    position: 'absolute',
    top: -UI_SIZES.spacing.big,
    right: 0,
  },
  spaceBadge: {
    backgroundColor: '#FC5E29',
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing._LEGACY_tiny,
    borderRadius: UI_SIZES.radius.huge,
    marginBottom: UI_SIZES.spacing.medium,
    alignSelf: 'flex-start',
  },
  spaceBadgeText: {
    color: theme.palette.grey.white,
  },
  spaceSvg: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  spaceText: {
    color: theme.palette.grey.white,
    paddingLeft: UI_SIZES.spacing.medium,
    paddingRight: UI_SIZES.spacing.big,
  },
});

export default styles;
