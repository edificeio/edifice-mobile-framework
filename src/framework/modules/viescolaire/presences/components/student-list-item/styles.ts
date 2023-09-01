import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.small,
    marginHorizontal: UI_SIZES.spacing.minor,
  },
  containerSelected: {
    backgroundColor: theme.palette.primary.pale,
    borderRadius: UI_SIZES.radius.medium,
  },
  lastCourseAbsentPicture: {
    marginRight: UI_SIZES.spacing.small,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  nameText: {
    marginHorizontal: UI_SIZES.spacing.small,
    flexShrink: 1,
  },
  statusesContainer: {
    flexDirection: 'row',
    columnGap: UI_SIZES.spacing.minor,
  },
});
