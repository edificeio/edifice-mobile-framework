import { StyleSheet } from 'react-native';

import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  modalCloseButtonWrapper: {
    alignSelf: 'flex-start',
    marginTop: UI_SIZES.spacing.medium,
  },
  modalHeaderContainer: {
    ...UI_STYLES.row,
    alignSelf: 'center',
    marginBottom: UI_SIZES.spacing.small,
  },
  modalHeaderIconStyle: {
    marginRight: UI_SIZES.spacing.small,
  },
  modalHeaderTitle: {
    fontSize: TextSizeStyle.Medium.fontSize,
  },
  modalWrapperContentContainer: {
    marginHorizontal: UI_SIZES.spacing.tiny,
    maxHeight: '90%',
    width: '100%',
  },
  modalWrapperMessageContainer: {
    marginVertical: UI_SIZES.spacing.small,
  },
  scrollContainer: {
    flexGrow: 1,
    marginVertical: UI_SIZES.spacing.small,
  },
  scrollContent: {
    paddingVertical: UI_SIZES.spacing.small,
  },
  scrollView: {
    maxHeight: UI_SIZES.screen.height * 0.6,
  },
});
