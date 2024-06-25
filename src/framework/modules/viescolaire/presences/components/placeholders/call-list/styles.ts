import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';

export default StyleSheet.create({
  //GLOBAL
  br4: {
    borderRadius: UI_SIZES.radius.small,
  },
  br8: {
    borderRadius: UI_SIZES.radius.medium,
  },
  h22: {
    height: getScaleWidth(22),
  },
  h38: {
    height: getScaleWidth(38),
  },
  mb0: {
    marginBottom: 0,
  },
  mt24: {
    marginTop: UI_SIZES.spacing.big,
  },
  w22: {
    width: getScaleWidth(22),
  },
  w36: {
    width: getScaleWidth(36),
  },
  //ELEMENTS
  dayPickerContainer: {
    rowGap: UI_SIZES.spacing.big,
    paddingHorizontal: UI_SIZES.spacing.large,
    paddingVertical: UI_SIZES.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey.pearl,
  },
  listContainer: {
    rowGap: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.medium,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
