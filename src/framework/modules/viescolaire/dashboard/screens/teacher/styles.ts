import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleHeight, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: UI_SIZES.spacing.huge,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  presencesCallContainer: {
    justifyContent: 'center',
    minHeight: getScaleHeight(70),
  },
  presencesCallListAction: {
    alignSelf: 'flex-end',
  },
  presencesContainer: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
    rowGap: UI_SIZES.spacing.medium,
  },
  presencesEmptyContainer: {
    alignItems: 'center',
    rowGap: UI_SIZES.spacing.minor,
  },
  presencesEmptyText: {
    color: theme.ui.text.light,
    textAlign: 'center',
  },
  presencesHeadingContainer: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
  },
});
