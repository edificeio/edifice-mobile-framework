import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { pageGutterSize } from '~/framework/components/page';

export default StyleSheet.create({
  actionContainerDisabled: {
    backgroundColor: theme.ui.text.light,
    borderColor: theme.ui.text.light,
    opacity: 0.5,
  },
  actionContainerEnabled: {
    backgroundColor: theme.palette.secondary.regular,
    borderColor: theme.palette.secondary.regular,
    opacity: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: pageGutterSize,
  },
  dropdownContainer: {
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
    marginBottom: UI_SIZES.spacing.medium,
  },
  dropdownText: {
    color: theme.ui.text.regular,
  },
  errorAlert: {
    marginBottom: UI_SIZES.spacing.medium,
  },
  informationInput: {
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderRadius: 5,
    borderWidth: 1,
    color: theme.ui.text.regular,
    height: 100,
    marginBottom: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.small,
  },
  phoneNumberInput: {
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderRadius: 5,
    borderWidth: 1,
    color: theme.ui.text.regular,
    marginBottom: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.small,
  },
  rowContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: UI_SIZES.spacing.medium,
  },
  textMargin: {
    marginBottom: UI_SIZES.spacing.minor,
  },
});
