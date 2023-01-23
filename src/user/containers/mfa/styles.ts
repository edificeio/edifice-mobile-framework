import { Platform, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleHeight, getScaleWidth } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  animation: {
    width: UI_SIZES.elements.thumbnail,
    height: UI_SIZES.elements.thumbnail,
  },
  codeFieldCell: {
    width: getScaleWidth(45),
    height: getScaleHeight(58),
    lineHeight: Platform.select({ ios: getScaleHeight(58), android: TextSizeStyle.Huge.lineHeight }),
    textAlignVertical: 'center',
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.dimensions.width.tiny,
    textAlign: 'center',
  },
  codeFieldContainer: { marginTop: UI_SIZES.spacing.large, paddingHorizontal: UI_SIZES.spacing.medium },
  codeFieldWrapper: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  codeStateText: { textAlign: 'center', marginTop: UI_SIZES.spacing.small },
  container: { flex: 1, paddingHorizontal: UI_SIZES.spacing.medium },
  content: { textAlign: 'center' },
  contentContainer: { flex: 1 },
  contentSent: { textAlign: 'center', marginTop: UI_SIZES.spacing.medium },
  feedbackContainer: { alignItems: 'center', marginTop: UI_SIZES.spacing.medium },
  imageContainer: { paddingTop: UI_SIZES.spacing.medium, alignSelf: 'center' },
  issueText: { textAlign: 'center' },
  page: { backgroundColor: theme.ui.background.card },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: UI_SIZES.spacing.small,
    marginBottom: UI_SIZES.spacing.big,
  },
  resendContainer: { justifyContent: 'flex-end' },
  resendText: { marginLeft: UI_SIZES.spacing.minor },
  title: { textAlign: 'center', marginTop: UI_SIZES.spacing.medium },
});
