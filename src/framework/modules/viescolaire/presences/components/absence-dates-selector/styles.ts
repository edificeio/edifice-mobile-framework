import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    rowGap: UI_SIZES.spacing.medium,
    borderWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.newCard,
  },
  dateContainer: {
    flex: 1,
    justifyContent: 'center',
    rowGap: UI_SIZES.spacing.tiny,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  endDateLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeEndDateAction: {
    backgroundColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.large,
    padding: UI_SIZES.spacing._LEGACY_tiny,
  },
  separatorContainer: {
    width: 1,
    height: '100%',
    backgroundColor: theme.palette.grey.cloudy,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: UI_SIZES.spacing.minor,
  },
  timeText: {
    marginLeft: UI_SIZES.spacing.medium,
    marginRight: UI_SIZES.spacing.minor,
  },
});
