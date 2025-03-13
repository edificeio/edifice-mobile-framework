import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const CARD_UNEXPANDED_MARGIN_TOP = -UI_SIZES.cardSpacing.major;
export const CARD_EXPANDED_MARGIN_TOP = -UI_SIZES.cardSpacing.small;
export const CARD_EXPANDED_MARGIN_BOTTOM = UI_SIZES.spacing.large;

export const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.mediumPlus,
    elevation: 4,
    marginHorizontal: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.medium,
    position: 'relative',
    shadowColor: theme.palette.grey.darkness,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: UI_SIZES.radius.newCard / 2,
  },
  expandButtonText: {
    color: theme.palette.grey.graphite,
    marginRight: UI_SIZES.spacing.tiny,
  },
  expandedButton: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  showMoreLessText: {
    color: theme.palette.grey.graphite,
    marginHorizontal: UI_SIZES.spacing.tiny,
  },
  unexpandedButton: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    bottom: 0,
    flexDirection: 'row',
    position: 'absolute',
    right: 0,
  },
});
