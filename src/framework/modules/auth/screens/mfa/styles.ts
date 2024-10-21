import { Platform, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleHeight, getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  animation: {
    height: UI_SIZES.elements.thumbnail,
    width: UI_SIZES.elements.thumbnail,
  },
  codeFieldCell: {
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.dimensions.width.tiny,
    height: getScaleHeight(58),
    lineHeight: Platform.select({ android: TextSizeStyle.Huge.lineHeight, ios: getScaleHeight(58) }),
    textAlign: 'center',
    textAlignVertical: 'center',
    width: getScaleWidth(45),
  },
  codeFieldContainer: { marginTop: UI_SIZES.spacing.large, paddingHorizontal: UI_SIZES.spacing.medium },
  codeFieldWrapper: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  codeStateText: { marginTop: UI_SIZES.spacing.small, textAlign: 'center' },
  container: { flex: 1, paddingHorizontal: UI_SIZES.spacing.medium },
  content: { textAlign: 'center' },
  contentContainer: { flex: 1 },
  contentSent: { marginTop: UI_SIZES.spacing.medium, textAlign: 'center' },
  feedbackContainer: { alignItems: 'center', marginTop: UI_SIZES.spacing.medium },
  imageContainer: { alignSelf: 'center', paddingTop: UI_SIZES.spacing.medium },
  issueText: { textAlign: 'center' },
  page: { backgroundColor: theme.ui.background.card },
  resendButton: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: UI_SIZES.spacing.big,
    marginTop: UI_SIZES.spacing.small,
  },
  resendContainer: { justifyContent: 'flex-end' },
  resendText: { marginLeft: UI_SIZES.spacing.minor },
  title: { marginTop: UI_SIZES.spacing.medium, textAlign: 'center' },
});
