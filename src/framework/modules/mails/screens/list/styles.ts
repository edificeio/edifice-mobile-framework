import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  bottomSheet: {
    paddingBottom: 0,
  },
  defaultFolders: {
    rowGap: UI_SIZES.spacing.minor,
  },
  emptyscreen: {
    backgroundColor: theme.palette.grey.white,
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
  searchModeTopButton: {
    marginBottom: UI_SIZES.spacing.tiny,
  },
  selectFolderTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: UI_SIZES.spacing.medium,
  },
  selectMode: {
    backgroundColor: theme.palette.grey.white,
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  selectModeBottom: {
    alignItems: 'baseline',
    columnGap: UI_SIZES.spacing.medium,
    height: UI_SIZES.elements.tabbarHeight + UI_SIZES.screen.bottomInset,
    justifyContent: 'flex-end',
    paddingTop: UI_SIZES.spacing.small,
  },
  selectModeShadow: {
    elevation: 6,
    shadowColor: theme.palette.grey.darkness,
    shadowOffset: { height: -6, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  selectModeTop: {
    alignContent: 'flex-end',
    alignItems: 'flex-end',
    columnGap: UI_SIZES.spacing.small,
    height: UI_SIZES.elements.navbarHeight + UI_SIZES.screen.topInset,
    justifyContent: 'space-between',
    paddingBottom: UI_SIZES.spacing.tiny,
  },
  selectModeTopButton: {
    alignSelf: 'flex-end',
  },
  selectModeTopText: {
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    paddingBottom: UI_SIZES.spacing.tiny,
  },
  spacingFolder: {
    height: UI_SIZES.spacing.tiny,
  },
});
