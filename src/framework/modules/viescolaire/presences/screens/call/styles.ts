import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  listFooterContainer: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.tiny,
    rowGap: UI_SIZES.spacing.tiny,
  },
  listHeaderContainer: {
    borderBottomColor: theme.palette.grey.cloudy,
    borderBottomWidth: UI_SIZES.border.thin,
    marginBottom: UI_SIZES.spacing.tiny,
    padding: UI_SIZES.spacing.medium,
  },
  pageContainer: {
    backgroundColor: theme.palette.grey.white,
  },
  separatorContainer: {
    backgroundColor: theme.palette.grey.cloudy,
    height: 1,
    marginVertical: UI_SIZES.spacing.tiny,
  },
  summaryContainer: {
    paddingVertical: UI_SIZES.spacing.medium,
  },
  validateContainer: {
    marginVertical: UI_SIZES.spacing.medium,
  },
});
