import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  detailsDate: {
    color: theme.palette.grey.graphite,
  },
  detailsHeader: {
    backgroundColor: theme.palette.grey.fog,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  detailsHeaderTopContent: {
    marginTop: 0,
  },
  detailsOwner: {
    marginVertical: UI_SIZES.spacing.small,
  },
  ressourceView: {
    backgroundColor: theme.palette.grey.white,
    borderBottomColor: theme.palette.grey.pearl,
    borderBottomWidth: 1,
  },
});
