import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  buttons: {
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  page: {
    backgroundColor: theme.palette.grey.white,
    padding: UI_SIZES.spacing.medium,
  },
  recipients: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.tiny,
  },
  recipientsText: {
    flexShrink: 1,
  },
  sender: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  senderName: {
    color: theme.palette.primary.regular,
  },
  topInfos: {
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
    marginVertical: UI_SIZES.spacing.medium,
  },
  topInfosText: {
    flex: 1,
  },
});
