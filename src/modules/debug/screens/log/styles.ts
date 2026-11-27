import { StyleSheet } from 'react-native';

import theme, { defaultTheme } from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  detailsBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    width: '100%',
  },
  logDetailsContainer: {
    justifyContent: 'center',
    padding: 8,
  },
  logSeverity: {
    fontWeight: 'bold',
  },
  page: {
    backgroundColor: theme.palette.grey.white,
    flex: 1,
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
