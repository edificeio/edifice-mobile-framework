import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    rowGap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
  eventContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.minor,
  },
  eventBulletContainer: {
    width: 6,
    height: 6,
    backgroundColor: theme.palette.grey.black,
    borderRadius: 3,
  },
  listEmptyText: {
    color: theme.ui.text.light,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.big,
  },
  showMoreButton: {
    alignSelf: 'flex-end',
  },
});
