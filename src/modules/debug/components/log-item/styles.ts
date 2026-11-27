import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  logContainer: {
    flexDirection: 'row',
    padding: UI_SIZES.spacing.minor,
  },
  logMessageContainer: {
    paddingLeft: UI_SIZES.spacing.tiny,
    width: '80%',
  },
  logSeverity: {
    fontWeight: 'bold',
  },
  logTimeAndSeverityContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    width: '20%',
  },
});
