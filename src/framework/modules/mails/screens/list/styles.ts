import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  bottomSheet: {
    paddingBottom: 0,
  },
  defaultFolders: {
    rowGap: UI_SIZES.spacing.minor,
  },
  flatListBottomSheet: {
    paddingBottom: UI_SIZES.screen.bottomInset + UI_SIZES.spacing.small,
  },
  newFolderButton: {
    alignSelf: 'baseline',
    marginLeft: UI_SIZES.spacing.minor,
    marginTop: UI_SIZES.spacing.minor,
  },
  newFolderHeader: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.big,
  },
  page: {
    backgroundColor: theme.palette.grey.white,
  },
  scrollViewBottomSheet: {
    paddingBottom: getScaleWidth(60),
  },
  selectFolderTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: UI_SIZES.spacing.medium,
  },
  spacingFolder: {
    height: UI_SIZES.spacing.tiny,
  },
});
