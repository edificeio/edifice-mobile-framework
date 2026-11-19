import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  actionText: {
    marginRight: UI_SIZES.spacing.minor,
    textAlign: 'center',
  },
  attachmentsContainer: {
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderRadius: 5,
    borderWidth: UI_SIZES.border.thin,
    marginBottom: UI_SIZES.spacing.medium,
  },
  // Android only: the list of the category picker takes place in the page (`relative`), from the bottom of the picker (over its margin)
  categoryDropdownListAndroid: {
    position: 'relative',
    top: -16,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: UI_SIZES.spacing.medium,
  },
  descriptionInput: {
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderRadius: 5,
    borderWidth: UI_SIZES.border.thin,
    color: theme.ui.text.regular,
    height: 100,
    marginBottom: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.small,
  },
  dropdownContainer: {
    borderColor: theme.palette.primary.regular,
    borderWidth: UI_SIZES.border.thin,
    marginBottom: UI_SIZES.spacing.medium,
  },
  dropdownText: {
    color: theme.ui.text.regular,
  },
  // Under the lists of the pickers
  fields: {
    zIndex: -2,
  },
  informationText: {
    color: theme.ui.text.light,
    marginBottom: UI_SIZES.spacing.medium,
  },
  inputLabelText: {
    marginBottom: UI_SIZES.spacing.minor,
  },
  mandatoryText: {
    color: theme.palette.complementary.red.regular,
  },
  // Under the list of the category picker
  structureDropdown: {
    zIndex: -1,
  },
  subjectInput: {
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderRadius: 5,
    borderWidth: UI_SIZES.border.thin,
    color: theme.ui.text.regular,
    marginBottom: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.small,
  },
  textIconContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginRight: UI_SIZES.spacing.minor,
    marginVertical: UI_SIZES.spacing.big,
  },
  textIconContainerSmallerMargin: {
    marginVertical: UI_SIZES.spacing.small,
  },
  titleText: {
    marginBottom: UI_SIZES.spacing.minor,
  },
});
