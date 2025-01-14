import { StyleSheet } from 'react-native';

import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  bottomSheet: {
    paddingBottom: 0,
  },
  flatListBottomSheet: {
    paddingBottom: getScaleWidth(140),
  },
  scrollViewBottomSheet: {
    paddingBottom: getScaleWidth(60),
  },
  defaultFolders: {
    rowGap: UI_SIZES.spacing.minor,
  },
  newFolderButton: {
    alignSelf: 'baseline',
    marginLeft: UI_SIZES.spacing.minor,
    marginTop: UI_SIZES.spacing.minor,
  },
  spacingFolder: {
    height: UI_SIZES.spacing.tiny,
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
