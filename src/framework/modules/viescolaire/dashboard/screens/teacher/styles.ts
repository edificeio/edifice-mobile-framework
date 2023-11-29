import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleHeight } from '~/framework/components/constants';

export default StyleSheet.create({
  appsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: UI_SIZES.spacing.huge,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  presencesCallContainer: {
    justifyContent: 'center',
    minHeight: getScaleHeight(70),
  },
  presencesContainer: {
    rowGap: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  presencesCallListAction: {
    alignSelf: 'flex-end',
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
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.minor,
  },
});
