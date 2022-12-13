import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    margin: UI_SIZES.spacing.medium,
  },
  textMargin: {
    marginBottom: UI_SIZES.spacing.minor,
  },
  phoneNumberInput: {
    marginBottom: UI_SIZES.spacing.big,
    padding: UI_SIZES.spacing.small,
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderWidth: 1,
    borderRadius: 5,
    color: theme.ui.text.regular,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateMargin: {
    marginBottom: UI_SIZES.spacing.medium,
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
  actionContainer: {
    backgroundColor: theme.palette.secondary.regular,
    borderColor: theme.palette.secondary.regular,
  },
});
