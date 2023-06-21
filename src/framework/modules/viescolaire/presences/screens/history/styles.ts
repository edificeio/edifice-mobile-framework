import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { pageGutterSize } from '~/framework/components/page';
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
});
