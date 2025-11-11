import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleFontSize, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  allergyExpandedText: {
    color: theme.palette.complementary.orange.regular,
    fontSize: getScaleFontSize(12),
    fontStyle: 'italic',
    marginTop: UI_SIZES.spacing.tiny,
  },

  allergyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  allergyHeaderLeft: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  allergyHeaderRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  allergyText: {
    color: theme.palette.grey.graphite,
    fontSize: getScaleFontSize(12),
    fontStyle: 'italic',
    marginLeft: UI_SIZES.spacing.tiny,
  },

  // Main container
  container: {
    flex: 1,
  },

  legendAllergenIcon: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.small,
    height: UI_SIZES.elements.icon.xsmall,
    justifyContent: 'center',
    marginRight: UI_SIZES.spacing.tiny,
    width: UI_SIZES.elements.icon.xsmall,
  },

  // Legend styles
  legendContainer: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.medium,
    marginBottom: UI_SIZES.spacing.large,
    marginTop: UI_SIZES.spacing.large,
    padding: UI_SIZES.spacing.medium,
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
    fontSize: getScaleFontSize(12),
  },

  legendTitle: {
    color: theme.palette.grey.black,
    fontSize: getScaleFontSize(14),
    marginBottom: UI_SIZES.spacing.tiny,
  },

  // Menu container
  menuContainer: {
    flex: 1,
  },

  // Menu item
  menuItem: {
    borderBottomColor: theme.palette.grey.cloudy,
    borderBottomWidth: UI_SIZES.border.thin,
    marginBottom: UI_SIZES.spacing.tiny,
    paddingBottom: UI_SIZES.spacing.tiny,
  },

  menuItemHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: UI_SIZES.spacing.tiny,
  },

  menuItemIcon: {
    height: UI_SIZES.elements.icon.xsmall,
    marginLeft: UI_SIZES.spacing.tiny,
    width: UI_SIZES.elements.icon.xsmall,
  },

  menuItemIcons: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: UI_SIZES.spacing.tiny,
  },

  menuItemLast: {
    borderBottomWidth: 0,
  },

  menuItemName: {
    color: theme.palette.grey.black,
    fontSize: getScaleFontSize(13),
  },

  menuItemNameContainer: {
    flex: 1,
  },

  menuItemRightContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  // Menu items container
  menuItemsContainer: {
    backgroundColor: theme.palette.grey.white,
    borderLeftWidth: 4,
    borderRadius: UI_SIZES.radius.medium,
    padding: UI_SIZES.spacing.minor,
  },

  // Menu section
  menuSection: {
    marginBottom: UI_SIZES.spacing.minor,
  },

  sectionTitle: {
    color: theme.palette.grey.black,
    fontSize: getScaleFontSize(14),
    marginBottom: UI_SIZES.spacing.tiny,
    textAlign: 'left',
  },

  sectionTitleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  titleDot: {
    borderRadius: UI_SIZES.radius.medium,
    height: 8,
    marginRight: UI_SIZES.spacing.tiny,
    width: 8,
  },
});
