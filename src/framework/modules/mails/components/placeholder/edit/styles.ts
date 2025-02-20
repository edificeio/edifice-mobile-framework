import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  attachments: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  body: {
    backgroundColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.card,
    height: 160,
    width: '100%',
  },
  content: {
    padding: UI_SIZES.spacing.medium,
  },
  h22: {
    backgroundColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.card,
    height: 22,
    marginBottom: 0,
  },

  h46: {
    backgroundColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.selector,
    height: 46,
    marginBottom: 0,
  },
  input: {
    borderBottomWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.grey.cloudy,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
});
