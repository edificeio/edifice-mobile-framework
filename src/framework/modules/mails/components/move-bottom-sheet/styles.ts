import { StyleSheet } from 'react-native';

import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  contentBottomSheet: {
    minHeight: 200,
    paddingBottom: getScaleWidth(60),
  },
  nofolders: {
    alignItems: 'center',
    rowGap: UI_SIZES.spacing.medium,
  },
  nofoldersContainer: {
    borderWidth: 0,
  },
});
