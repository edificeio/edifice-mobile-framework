import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';

export default StyleSheet.create({
  sectionBottom: {
    marginVertical: UI_SIZES.spacing.large,
  },
  logoutButton: {
    color: theme.palette.status.failure.regular,
    textAlign: 'center',
  },
  versionButton: {
    color: theme.palette.grey.graphite,
    textAlign: 'center',
  },
});
