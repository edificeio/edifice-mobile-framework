import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  input: {
    paddingVertical: UI_SIZES.spacing.small,
    paddingHorizontal: UI_SIZES.spacing.medium,
    borderBottomWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.grey.cloudy,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    padding: UI_SIZES.spacing.medium,
  },
  body: {
    height: 160,
    width: '100%',
    borderRadius: UI_SIZES.radius.card,
    backgroundColor: theme.palette.grey.pearl,
  },
  attachments: {
    paddingVertical: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },

  h22: {
    height: 22,
    borderRadius: UI_SIZES.radius.card,
    marginBottom: 0,
    backgroundColor: theme.palette.grey.cloudy,
  },
  h46: {
    height: 46,
    borderRadius: UI_SIZES.radius.selector,
    marginBottom: 0,
    backgroundColor: theme.palette.grey.cloudy,
  },
});
