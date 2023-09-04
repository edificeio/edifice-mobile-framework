import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';

export default StyleSheet.create({
  //GLOBAL
  br4: {
    borderRadius: UI_SIZES.radius.small,
  },
  h24: {
    height: getScaleWidth(24),
  },
  mb0: {
    marginBottom: 0,
  },
  //ELEMENTS
  cardContainer: {
    padding: UI_SIZES.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey.pearl,
    marginBottom: UI_SIZES.spacing.tiny,
  },
  listContainer: {
    paddingHorizontal: UI_SIZES.spacing.minor,
  },
  studentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.small,
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.small,
  },
  studentPicture: {
    backgroundColor: theme.palette.grey.cloudy,
  },
});
