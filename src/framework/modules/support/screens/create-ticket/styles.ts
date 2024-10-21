import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { pageGutterSize } from '~/framework/components/page';

export default StyleSheet.create({
  actionText: {
    marginRight: UI_SIZES.spacing.minor,
    textAlign: 'center',
  },
  attachmentsContainer: {
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: UI_SIZES.spacing.medium,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: pageGutterSize,
  },
  descriptionInput: {
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderRadius: 5,
    borderWidth: 1,
    color: theme.ui.text.regular,
    height: 100,
    marginBottom: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.small,
  },
  dropdownContainer: {
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
    marginBottom: UI_SIZES.spacing.medium,
  },
  dropdownText: {
    color: theme.ui.text.regular,
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
  subjectInput: {
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderRadius: 5,
    borderWidth: 1,
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
