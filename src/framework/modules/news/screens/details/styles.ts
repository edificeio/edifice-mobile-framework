import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  ressourceView: {
    backgroundColor: theme.palette.grey.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey.pearl,
  },
  detailsHeader: {
    backgroundColor: theme.palette.grey.fog,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  detailsHeaderTopContent: {
    marginTop: 0,
  },
  detailsDate: {
    color: theme.palette.grey.graphite,
  },
  detailsOwner: {
    marginVertical: UI_SIZES.spacing.small,
  },
});
