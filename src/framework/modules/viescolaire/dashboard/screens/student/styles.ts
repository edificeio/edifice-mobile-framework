import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';

export default StyleSheet.create({
  dashboardPart: { paddingHorizontal: UI_SIZES.spacing.medium, paddingVertical: UI_SIZES.spacing.minor },
  declareAbscenceText: {
    color: theme.palette.grey.white,
  },
  declareAbsenceButton: {
    alignSelf: 'stretch',
    backgroundColor: viescoTheme.palette.presences,
    borderRadius: 5,
    justifyContent: 'center',
    marginLeft: UI_SIZES.spacing.small,
    paddingHorizontal: UI_SIZES.spacing.tiny,
  },
  gridAllModules: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridModulesLine: {
    width: '100%',
  },

  mainContainer: {
    flex: 1,
  },
  subtitle: {
    color: theme.palette.grey.stone,
  },
});
