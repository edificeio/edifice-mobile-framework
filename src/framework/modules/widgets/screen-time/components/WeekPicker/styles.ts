import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, UI_VALUES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.pearl,
    borderColor: theme.palette.grey.stone,
    borderRadius: UI_SIZES.radius.selector,
    borderWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
  disabledContainer: {
    opacity: UI_VALUES.opacity.half,
  },
  weekText: {
    flex: 1,
    textAlign: 'center',
  },
  weekTextContainer: {
    alignItems: 'center',
    flex: 1,
  },
});
