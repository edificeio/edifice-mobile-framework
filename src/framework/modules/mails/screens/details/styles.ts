import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  attachmentCarbonioLabel: {
    flex: 1,
  },

  attachmentExternalContainer: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },

  // Carbonio: list of attachments that open web on press (no base component change)
  attachmentsExternal: {
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: UI_SIZES.spacing.minor,
  },

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

  redirectToWebview: {
    marginBottom: UI_SIZES.spacing.medium,
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
