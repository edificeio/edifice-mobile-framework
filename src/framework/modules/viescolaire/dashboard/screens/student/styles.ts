import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';

export default StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  declareAbscenceText: {
    color: theme.palette.grey.white,
  },
  dashboardPart: { paddingVertical: UI_SIZES.spacing.minor, paddingHorizontal: UI_SIZES.spacing.medium },
  gridAllModules: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridModulesLine: {
    width: '100%',
  },

  subtitle: {
    color: theme.palette.grey.stone,
  },
  declareAbsenceButton: {
    backgroundColor: viescoTheme.palette.presences,
    marginLeft: UI_SIZES.spacing.small,
    paddingHorizontal: UI_SIZES.spacing.tiny,
    justifyContent: 'center',
    alignSelf: 'stretch',
    borderRadius: 5,
  },
});
