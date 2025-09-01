import { StyleSheet } from 'react-native';

import theme, { defaultTheme } from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  detailsBarButton: {
    color: 'blue',
    fontSize: 18,
    marginRight: 8,
  },
  detailsBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    width: '100%',
  },
  detailsBarLevel: {},
  logContainer: {
    flexDirection: 'row',
    padding: UI_SIZES.spacing.minor,
  },
  logDetailsContainer: {
    justifyContent: 'center',
    padding: 8,
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
    borderColor: theme.palette.grey.graphite,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.border.thin,
    flex: 1,
    height: UI_SIZES.dimensions.height.huge,
    marginBottom: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.minor,
  },
  searchBarButton: {
    marginHorizontal: UI_SIZES.spacing.tiny,
  },
  searchBarContainer: {
    alignItems: 'center',
    flexDirection: 'row',
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
