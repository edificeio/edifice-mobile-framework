import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  recapHeader: {
    paddingVertical: UI_SIZES.spacing.small,
    alignSelf: 'flex-end',
    width: '90%',
    marginBottom: UI_SIZES.spacing.medium,
  },
  recapHeaderView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recapHeaderText: {
    marginHorizontal: UI_SIZES.spacing.tiny,
  },
  timePickerRowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: UI_SIZES.spacing.small,
  },
  timePickerText: {
    marginRight: UI_SIZES.spacing.minor,
  },
  inputContainer: {
    marginHorizontal: UI_SIZES.spacing.large,
  },
  labelText: {
    marginTop: UI_SIZES.spacing.big,
    marginBottom: UI_SIZES.spacing.tiny,
  },
  reasonTextInput: {
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey.cloudy,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  buttonOkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    marginVertical: UI_SIZES.spacing.big,
  },
  deleteButton: {
    marginRight: UI_SIZES.spacing.medium,
  },
});
