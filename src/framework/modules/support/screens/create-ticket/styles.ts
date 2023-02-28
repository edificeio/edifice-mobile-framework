import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    padding: UI_SIZES.spacing.medium,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  titleText: {
    marginBottom: UI_SIZES.spacing.minor,
  },
  informationText: {
    marginBottom: UI_SIZES.spacing.medium,
    color: theme.ui.text.light,
  },
  dropdownContainer: {
    marginBottom: UI_SIZES.spacing.medium,
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
  },
  dropdownText: {
    color: theme.ui.text.regular,
  },
  inputLabelText: {
    marginBottom: UI_SIZES.spacing.minor,
  },
  mandatoryText: {
    color: theme.palette.complementary.red.regular,
  },
  subjectInput: {
    marginBottom: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.small,
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderWidth: 1,
    borderRadius: 5,
    color: theme.ui.text.regular,
  },
  descriptionInput: {
    marginBottom: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.small,
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderWidth: 1,
    borderRadius: 5,
    height: 100,
    color: theme.ui.text.regular,
  },
  attachmentsContainer: {
    marginBottom: UI_SIZES.spacing.medium,
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderWidth: 1,
    borderRadius: 5,
  },
  textIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: UI_SIZES.spacing.big,
    marginRight: UI_SIZES.spacing.minor,
  },
  textIconContainerSmallerMargin: {
    marginVertical: UI_SIZES.spacing.small,
  },
  actionText: {
    textAlign: 'center',
    marginRight: UI_SIZES.spacing.minor,
  },
  actionContainer: {
    marginBottom: UI_SIZES.spacing.medium,
  },
});
