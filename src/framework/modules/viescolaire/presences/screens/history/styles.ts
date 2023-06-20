import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';

export default StyleSheet.create({
  declareAbsenceButton: {
    backgroundColor: viescoTheme.palette.presences,
    marginLeft: UI_SIZES.spacing.small,
    paddingHorizontal: UI_SIZES.spacing.tiny,
    justifyContent: 'center',
    alignSelf: 'stretch',
    borderRadius: 5,
  },
  declareAbscenceText: {
    color: theme.ui.text.inverse,
  },
  container: {
    flexGrow: 1,
    padding: UI_SIZES.spacing.medium,
  },
  dropdown: {
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
  },
  dropdownMargin: {
    marginBottom: UI_SIZES.spacing.small,
  },
  dropdownText: {
    color: theme.ui.text.regular,
  },
});
