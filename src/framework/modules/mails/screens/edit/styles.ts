import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, UI_VALUES } from '~/framework/components/constants';

export default StyleSheet.create({
  bottomForm: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingTop: UI_SIZES.spacing.minor,
  },
  bottomSheet: {
    // minHeight: 600,
  },
  editor: {
    flexGrow: 1,
    minHeight: '20%',
    paddingHorizontal: UI_SIZES.spacing.medium,
    zIndex: -1,
  },
  page: {
    backgroundColor: theme.palette.grey.white,
  },
  sendingOverlay: {
    alignItems: 'center',
    backgroundColor: `rgba(0, 0, 0, ${UI_VALUES.opacity.modal})`,
    flex: 1,
    justifyContent: 'center',
  },
});
