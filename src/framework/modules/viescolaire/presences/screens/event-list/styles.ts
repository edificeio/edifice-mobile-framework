import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  eventBulletContainer: {
    backgroundColor: theme.palette.grey.black,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  eventContainer: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    marginLeft: UI_SIZES.spacing.medium,
  },
  headingText: {
    color: theme.ui.text.light,
    marginBottom: UI_SIZES.spacing.medium,
  },
  listContentContainer: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
  },
  pageContainer: {
    backgroundColor: theme.palette.grey.white,
  },
});
