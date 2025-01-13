import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  customFolders: {
    marginBottom: UI_SIZES.spacing.minor,
    rowGap: UI_SIZES.spacing.minor,
  },
  defaultFolders: {
    rowGap: UI_SIZES.spacing.minor,
  },
  newFolderButton: {
    alignSelf: 'baseline',
    marginLeft: UI_SIZES.spacing.minor,
  },
  newFolderHeader: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.big,
  },
  selectFolderTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.medium,
  },
});
