import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  checkbox: {
    marginRight: UI_SIZES.spacing.small,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
  containerChecked: {
    backgroundColor: theme.palette.primary.pale,
  },
  containerUnread: {
    backgroundColor: theme.palette.secondary.pale,
  },
  date: {
    color: theme.palette.grey.graphite,
  },
  defaultFolder: {
    marginLeft: UI_SIZES.spacing.small,
  },
  draftText: {
    color: theme.palette.status.failure.regular,
  },
  firstText: {
    flexShrink: 1,
  },
  line: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.tiny,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  responseIcon: {
    marginLeft: UI_SIZES.spacing.small,
  },
  swipeAction: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: 80,
  },
  swipeDeleteAction: {
    backgroundColor: theme.palette.status.failure.regular,
  },
  swipeOtherAction: {
    backgroundColor: theme.palette.status.warning.regular,
  },
  texts: {
    flex: 1,
    marginLeft: UI_SIZES.spacing.small,
  },
});
