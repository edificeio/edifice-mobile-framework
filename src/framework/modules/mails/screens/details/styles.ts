import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  bottomSheet: {
    paddingBottom: 0,
  },
  bottomSheetPrefix: {
    marginBottom: UI_SIZES.spacing.minor,
  },
  buttons: {
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: UI_SIZES.spacing.large,
  },
  contentBottomSheet: {
    minHeight: 200,
    paddingBottom: getScaleWidth(120),
  },
  originalContent: {
    alignSelf: 'flex-start',
  },
  page: {
    backgroundColor: theme.palette.grey.white,
    padding: UI_SIZES.spacing.medium,
  },
  recipients: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.tiny,
    flexDirection: 'row',
  },
  recipientsText: {
    flexShrink: 1,
  },
  sender: {
    columnGap: UI_SIZES.spacing.tiny,
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
  touchableSender: {
    flex: 1,
  },
});
