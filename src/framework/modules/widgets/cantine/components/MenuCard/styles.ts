import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleFontSize, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  // Allergen warning
  allergenWarning: {
    alignItems: 'center',
    backgroundColor: theme.palette.complementary.orange.pale,
    borderRadius: UI_SIZES.radius.medium,
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.large,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
  },

  allergenWarningText: {
    color: theme.palette.complementary.orange.regular,
    fontSize: getScaleFontSize(14),
    fontWeight: '600',
    marginLeft: UI_SIZES.spacing.tiny,
  },

  // Allergy badge
  allergyBadge: {
    alignItems: 'center',
    backgroundColor: theme.palette.complementary.orange.pale,
    borderRadius: UI_SIZES.radius.small,
    justifyContent: 'center',
    padding: 4,
  },

  allergyText: {
    color: theme.palette.complementary.orange.regular,
    fontSize: getScaleFontSize(12),
    fontStyle: 'italic',
    marginLeft: UI_SIZES.spacing.tiny,
    marginTop: UI_SIZES.spacing.tiny,
  },

  // Main container
  container: {
    flex: 1,
  },

  footerText: {
    color: theme.palette.primary.regular,
    fontSize: getScaleFontSize(16),
    fontStyle: 'italic',
    fontWeight: '600',
    textAlign: 'center',
  },

  legendAllergenIcon: {
    alignItems: 'center',
    backgroundColor: theme.palette.complementary.orange.pale,
    borderRadius: UI_SIZES.radius.small,
    height: UI_SIZES.elements.icon.xsmall,
    justifyContent: 'center',
    marginRight: UI_SIZES.spacing.tiny,
    width: UI_SIZES.elements.icon.xsmall,
  },

  // Legend styles
  legendContainer: {
    backgroundColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.medium,
    marginBottom: UI_SIZES.spacing.large,
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
  },

  legendTitle: {
    color: theme.palette.grey.black,
    marginBottom: UI_SIZES.spacing.tiny,
  },

  // Menu container
  menuContainer: {
    flex: 1,
  },

  // Menu footer
  menuFooter: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.medium,
    padding: UI_SIZES.spacing.small,
  },

  // Menu item
  menuItem: {
    borderBottomColor: theme.palette.grey.cloudy,
    borderBottomWidth: 1,
    marginBottom: UI_SIZES.spacing.medium,
    paddingBottom: UI_SIZES.spacing.medium,
  },

  menuItemDescription: {
    color: theme.palette.grey.darkness,
    fontSize: getScaleFontSize(14),
    fontStyle: 'italic',
    lineHeight: 20,
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

  menuItemName: {
    color: theme.palette.grey.black,
    fontSize: getScaleFontSize(18),
    fontWeight: '600',
  },

  menuItemNameContainer: {
    flex: 1,
  },

  // Menu items container
  menuItemsContainer: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.medium,
    elevation: 3,
    padding: UI_SIZES.spacing.medium,
    shadowColor: theme.palette.grey.black,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Menu section
  menuSection: {
    marginBottom: UI_SIZES.spacing.large,
  },

  // Restaurant header
  restaurantHeader: {
    alignItems: 'center',
    backgroundColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.large,
    marginBottom: UI_SIZES.spacing.large,
    paddingHorizontal: UI_SIZES.spacing.large,
    paddingVertical: UI_SIZES.spacing.medium,
  },

  restaurantSubtitle: {
    color: theme.palette.grey.white,
    fontSize: getScaleFontSize(14),
    fontStyle: 'italic',
    marginTop: UI_SIZES.spacing.tiny,
    textAlign: 'center',
  },

  restaurantTitle: {
    color: theme.palette.grey.white,
    fontSize: getScaleFontSize(24),
    fontWeight: '700',
    marginLeft: UI_SIZES.spacing.tiny,
  },

  restaurantTitleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  sectionDivider: {
    backgroundColor: theme.palette.primary.regular,
    borderRadius: 2,
    height: 3,
    width: 60,
  },

  // Section header
  sectionHeader: {
    marginBottom: UI_SIZES.spacing.medium,
  },

  sectionTitle: {
    color: theme.palette.primary.regular,
    fontSize: getScaleFontSize(20),
    fontWeight: '700',
    marginBottom: UI_SIZES.spacing.tiny,
    textAlign: 'center',
  },

  sectionTitleContainer: {
    alignItems: 'center',
  },
});
