import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  modalCloseButtonWrapper: {
    alignSelf: 'flex-end',
    marginTop: UI_SIZES.spacing.small,
  },
  modalHeaderContainer: {
    ...UI_STYLES.row,
    alignContent: 'center',
    marginBottom: UI_SIZES.spacing.small,
  },
  modalHeaderIconStyle: {
    marginRight: UI_SIZES.spacing.small,
  },
  modalHeaderTitle: {
    fontSize: TextSizeStyle.Medium.fontSize,
  },
  modalWrapperContentContainer: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.mediumPlus,
    justifyContent: 'space-between',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.medium,
    width: '100%',
  },
  modalWrapperMessageContainer: {
    marginVertical: UI_SIZES.spacing.small,
  },
  scrollContainer: {
    maxHeight: getScaleWidth(100),
    paddingVertical: UI_SIZES.spacing.small,
  },
});
