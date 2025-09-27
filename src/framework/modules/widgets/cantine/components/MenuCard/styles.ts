import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleFontSize, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  allergyText: {
    fontSize: getScaleFontSize(12),
    fontStyle: 'italic',
    marginLeft: 4,
  },
  iconElement: {
    height: UI_SIZES.elements.icon.xsmall,
    marginLeft: 4,
    width: UI_SIZES.elements.icon.xsmall,
  },
  legendIcon: {
    height: UI_SIZES.elements.icon.xsmall,
    marginRight: UI_SIZES.spacing.tiny,
    width: UI_SIZES.elements.icon.xsmall,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.tiny,
    width: '48%',
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendText: {
    color: theme.palette.grey.black,
    flex: 1,
  },
  legendTitle: {
    color: theme.palette.grey.black,
    marginBottom: UI_SIZES.spacing.tiny,
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.minor,
    marginLeft: UI_SIZES.spacing.tiny,
    paddingHorizontal: UI_SIZES.spacing.tiny,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  menuItemContainer: {
    marginTop: UI_SIZES.spacing.minor,
  },
  menuItemContent: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'column',
  },
  menuItemIcons: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  menuItemName: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: UI_SIZES.spacing.minor,
  },
  menuItemNameText: {
    fontSize: getScaleFontSize(16),
  },
  menuItemText: {
    flex: 1,
  },
  menuItemType: {
    alignItems: 'center',
    backgroundColor: theme.palette.complementary.orange.pale,
    borderColor: theme.palette.complementary.orange.light,
    borderRadius: UI_SIZES.radius.small,
    borderWidth: 1,
    flexDirection: 'row',
    marginLeft: UI_SIZES.spacing.tiny,
    paddingHorizontal: UI_SIZES.spacing.tiny,
    paddingVertical: 2,
  },
  typeSection: {
    marginBottom: UI_SIZES.spacing.medium,
  },
  typeSectionTitle: {
    color: theme.palette.primary.regular,
    marginBottom: UI_SIZES.spacing.tiny,
    textTransform: 'capitalize',
  },
  typeTitleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.tiny,
  },
  typeTitleDot: {
    backgroundColor: theme.palette.primary.regular,
    borderRadius: 4,
    height: 8,
    marginRight: UI_SIZES.spacing.tiny,
    width: 8,
  },
});
