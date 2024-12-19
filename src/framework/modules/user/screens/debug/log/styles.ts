import { StyleSheet } from 'react-native';

import theme, { defaultTheme } from '~/app/theme';
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
  page: {
    backgroundColor: theme.palette.grey.white,
  },
  pausedBanner: {
    alignItems: 'center',
    backgroundColor: defaultTheme.palette.status.failure.regular,
    padding: UI_SIZES.spacing.minor,
  },
  searchBar: {
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.border.thin,
    height: UI_SIZES.dimensions.height.huge,
    marginBottom: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.minor,
  },
  searchBarContainer: {
    margin: UI_SIZES.spacing.small,
  },
  separator: {
    backgroundColor: theme.palette.grey.cloudy,
    height: UI_SIZES.border.thin,
  },
  separatorContainer: {
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.small,
  },
});
