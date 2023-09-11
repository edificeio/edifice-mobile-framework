import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { pageGutterSize } from '~/framework/components/page';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';

export default StyleSheet.create({
  absenceActionContainer: {
    marginTop: UI_SIZES.spacing.medium,
  },
  childrenListContainer: {
    padding: UI_SIZES.spacing.medium,
    borderBottomWidth: UI_SIZES.border.thin,
    borderBottomColor: theme.palette.grey.cloudy,
  },
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
  dropdown: {
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
  },
  dropdownMargin: {
    marginBottom: pageGutterSize,
  },
  dropdownText: {
    color: theme.ui.text.regular,
  },
  listContentContainer: {
    flexGrow: 1,
    paddingHorizontal: pageGutterSize,
    paddingTop: pageGutterSize,
  },
  listHeaderContainer: {
    zIndex: 1,
  },
  pageContainer: {
    backgroundColor: theme.palette.grey.white,
  },
});
