import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.small,
  },
  containerSelected: {
    backgroundColor: theme.palette.primary.pale,
    borderRadius: UI_SIZES.radius.medium,
  },
  lastCourseAbsentPicture: {
    marginRight: UI_SIZES.spacing.small,
  },
  leftContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
  },
  nameText: {
    flexShrink: 1,
    marginHorizontal: UI_SIZES.spacing.small,
  },
  statusesContainer: {
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
  },
});
