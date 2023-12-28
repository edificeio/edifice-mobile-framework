import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  eventContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.minor,
    marginLeft: UI_SIZES.spacing.medium,
  },
  eventBulletContainer: {
    width: 6,
    height: 6,
    backgroundColor: theme.palette.grey.black,
    borderRadius: 3,
  },
  headingText: {
    marginBottom: UI_SIZES.spacing.medium,
    color: theme.ui.text.light,
  },
  listContentContainer: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
  },
  pageContainer: {
    backgroundColor: theme.palette.grey.white,
  },
});
