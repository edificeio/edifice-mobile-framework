import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  //GLOBAL
  br4: {
    borderRadius: UI_SIZES.radius.small,
  },
  //ELEMENTS
  cardContainer: {
    borderBottomColor: theme.palette.grey.pearl,
    borderBottomWidth: 1,
    marginBottom: UI_SIZES.spacing.tiny,
    padding: UI_SIZES.spacing.medium,
  },

  h24: {
    height: getScaleWidth(24),
  },

  listContainer: {
    paddingHorizontal: UI_SIZES.spacing.minor,
  },
  mb0: {
    marginBottom: 0,
  },
  studentContainer: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.small,
  },
  studentPicture: {
    backgroundColor: theme.palette.grey.cloudy,
  },
});
