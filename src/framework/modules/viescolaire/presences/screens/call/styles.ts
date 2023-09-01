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
    padding: UI_SIZES.spacing.medium,
    marginBottom: UI_SIZES.spacing.tiny,
    borderBottomWidth: UI_SIZES.border.thin,
    borderBottomColor: theme.palette.grey.cloudy,
  },
  pageContainer: {
    backgroundColor: theme.palette.grey.white,
  },
  separatorContainer: {
    height: 1,
    marginVertical: UI_SIZES.spacing.tiny,
    backgroundColor: theme.palette.grey.cloudy,
  },
  summaryContainer: {
    paddingVertical: UI_SIZES.spacing.medium,
  },
  validateContainer: {
    marginVertical: UI_SIZES.spacing.medium,
  },
});
