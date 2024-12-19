import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.newCard,
    borderWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    rowGap: UI_SIZES.spacing.medium,
  },
  dateContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
    rowGap: UI_SIZES.spacing.tiny,
  },
  endDateLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  removeEndDateAction: {
    backgroundColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.large,
    padding: UI_SIZES.spacing._LEGACY_tiny,
  },
  separatorContainer: {
    backgroundColor: theme.palette.grey.cloudy,
    height: '100%',
    width: 1,
  },
  timeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: UI_SIZES.spacing.minor,
  },
  timeText: {
    marginLeft: UI_SIZES.spacing.medium,
    marginRight: UI_SIZES.spacing.minor,
  },
});
