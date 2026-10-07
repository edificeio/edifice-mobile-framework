import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: UI_SIZES.spacing.medium,
  },
  datePicker: {
    alignSelf: 'center',
  },
  datePickerContainer: {
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.medium,
  },
  info: {
    alignSelf: 'center',
    marginVertical: UI_SIZES.spacing.minor,
  },
  modeToggleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: UI_SIZES.spacing.minor,
  },

  separator: {
    backgroundColor: theme.palette.grey.cloudy,
    height: 1,
    marginVertical: UI_SIZES.spacing.tiny,
  },
  summary: {
    backgroundColor: theme.palette.complementary.yellow.pale,
    borderColor: theme.palette.complementary.yellow.light,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.border.thin,
    marginBottom: UI_SIZES.spacing.medium,
  },
  users: {
    marginBottom: UI_SIZES.spacing.small,
    marginHorizontal: -UI_SIZES.spacing.medium,
  },
  usersContent: {
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
});
