import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  space: {
    backgroundColor: '#1C1C73',
    borderRadius: UI_SIZES.radius.mediumPlus,
    marginBottom: UI_SIZES.spacing.medium,
    marginHorizontal: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.medium,
  },
  spaceAnim: {
    height: 100,
    position: 'absolute',
    right: 0,
    top: -UI_SIZES.spacing.big,
    width: 100,
  },
  spaceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FC5E29',
    borderRadius: UI_SIZES.radius.huge,
    marginBottom: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing._LEGACY_tiny,
  },
  spaceBadgeText: {
    color: theme.palette.grey.white,
  },
  spaceSvg: {
    bottom: 0,
    position: 'absolute',
    right: 0,
  },
  spaceText: {
    color: theme.palette.grey.white,
    paddingLeft: UI_SIZES.spacing.medium,
    paddingRight: UI_SIZES.spacing.big,
  },
});

export default styles;
