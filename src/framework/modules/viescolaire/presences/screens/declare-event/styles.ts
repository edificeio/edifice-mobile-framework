import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    padding: UI_SIZES.spacing.medium,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  dropdown: {
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
  },
  dropdownText: {
    color: theme.ui.text.regular,
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
    marginBottom: UI_SIZES.spacing.medium,
  },
  timePickerText: {
    marginRight: UI_SIZES.spacing.minor,
  },
  commentText: {
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
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteAction: {
    marginRight: UI_SIZES.spacing.medium,
  },
});
