import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  //GLOBAL
  br4: {
    borderRadius: UI_SIZES.radius.small,
  },
  br8: {
    borderRadius: UI_SIZES.radius.medium,
  },
  //ELEMENTS
  dayPickerContainer: {
    borderBottomColor: theme.palette.grey.pearl,
    borderBottomWidth: 1,
    paddingHorizontal: UI_SIZES.spacing.large,
    paddingVertical: UI_SIZES.spacing.medium,
    rowGap: UI_SIZES.spacing.big,
  },

  h22: {
    height: getScaleWidth(22),
  },

  h38: {
    height: getScaleWidth(38),
  },

  listContainer: {
    padding: UI_SIZES.spacing.medium,
    rowGap: UI_SIZES.spacing.medium,
  },

  mb0: {
    marginBottom: 0,
  },

  mt24: {
    marginTop: UI_SIZES.spacing.big,
  },

  rowContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  w22: {
    width: getScaleWidth(22),
  },
  w36: {
    width: getScaleWidth(36),
  },
});
