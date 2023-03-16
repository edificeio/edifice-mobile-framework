import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    padding: UI_SIZES.spacing.medium,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  dropdownContainer: {
    marginBottom: UI_SIZES.spacing.medium,
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
  },
  dropdownText: {
    color: theme.ui.text.regular,
  },
  textMargin: {
    marginBottom: UI_SIZES.spacing.minor,
  },
  phoneNumberInput: {
    marginBottom: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.small,
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderWidth: 1,
    borderRadius: 5,
    color: theme.ui.text.regular,
  },
  rowContainer: {
    marginBottom: UI_SIZES.spacing.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  informationInput: {
    marginBottom: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.small,
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderWidth: 1,
    borderRadius: 5,
    height: 100,
    color: theme.ui.text.regular,
  },
  errorAlert: {
    marginBottom: UI_SIZES.spacing.medium,
  },
  actionContainerEnabled: {
    backgroundColor: theme.palette.secondary.regular,
    borderColor: theme.palette.secondary.regular,
    opacity: 1,
  },
  actionContainerDisabled: {
    backgroundColor: theme.ui.text.light,
    borderColor: theme.ui.text.light,
    opacity: 0.5,
  },
});
