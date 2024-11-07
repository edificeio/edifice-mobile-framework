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
  recipientsItem: {
    columnGap: UI_SIZES.spacing.tiny,
    flexDirection: 'row',
  },
  recipientsText: {
    flex: 1,
    flexWrap: 'wrap',
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
