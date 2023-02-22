import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    padding: UI_SIZES.spacing.medium,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: UI_SIZES.spacing.medium,
  },
  switchPart: {
    flex: 1,
    justifyContent: 'center',
    padding: UI_SIZES.spacing.small,
    borderWidth: 1,
    borderColor: theme.palette.grey.cloudy,
  },
  leftSwitch: {
    borderBottomLeftRadius: UI_SIZES.radius.card,
    borderTopLeftRadius: UI_SIZES.radius.card,
  },
  rightSwitch: {
    borderBottomRightRadius: UI_SIZES.radius.card,
    borderTopRightRadius: UI_SIZES.radius.card,
  },
  rightSwitchSingle: {
    flexDirection: 'row',
  },
  rightSwitchSingleText: {
    marginHorizontal: UI_SIZES.spacing.minor,
  },
  selected: {
    backgroundColor: theme.palette.grey.white,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 1,
  },
  datePickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: UI_SIZES.spacing.medium,
  },
  timePickerMainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: UI_SIZES.spacing.medium,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timePickerText: {
    marginRight: UI_SIZES.spacing.minor,
  },
  commentLabelText: {
    marginBottom: UI_SIZES.spacing.minor,
  },
  commentInput: {
    marginBottom: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.small,
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderWidth: 1,
    borderRadius: 5,
    height: 100,
    color: theme.ui.text.regular,
  },
  filePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.medium,
  },
  iconAttMarginRight: {
    marginRight: UI_SIZES.spacing.minor,
  },
  createAction: {
    marginBottom: UI_SIZES.spacing.medium,
  },
});
