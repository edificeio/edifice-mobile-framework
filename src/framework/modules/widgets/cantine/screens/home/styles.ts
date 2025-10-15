import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: UI_SIZES.spacing.medium,
  },
  selectButtonWrapper: {
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.card,
    borderWidth: UI_SIZES.border.thin,
    paddingHorizontal: UI_SIZES.spacing.tiny,
    paddingVertical: UI_SIZES.spacing.tiny,
    width: '100%',
  },
  // Styles for structure list items
  structureListItem: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.small,
    padding: UI_SIZES.spacing.medium,
  },
  structureListItemContent: {
    flex: 1,
  },
  structureListItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: UI_SIZES.spacing.tiny,
  },
  structureListItemName: {
    flex: 1,
  },
});
