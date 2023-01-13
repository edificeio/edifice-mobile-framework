import { Platform, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleHeight, getScaleWidth } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  page: { backgroundColor: theme.ui.background.card },
  container: { flex: 1, paddingHorizontal: UI_SIZES.spacing.medium },
  contentContainer: { flex: 1 },
  imageContainer: { paddingTop: UI_SIZES.spacing.medium, alignSelf: 'center' },
  title: { textAlign: 'center', marginTop: UI_SIZES.spacing.medium },
  contentSent: { textAlign: 'center', marginTop: UI_SIZES.spacing.medium },
  content: { textAlign: 'center' },
  codeFieldContainer: { marginTop: UI_SIZES.spacing.large, paddingHorizontal: UI_SIZES.spacing.medium },
  codeFieldCell: {
    width: getScaleWidth(45),
    height: getScaleHeight(58),
    lineHeight: Platform.select({ ios: getScaleHeight(58), android: TextSizeStyle.Huge.lineHeight }),
    textAlignVertical: 'center',
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.dimensions.width.tiny,
    textAlign: 'center',
  },
  codeFieldWrapper: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  feedbackContainer: { alignItems: 'center', marginTop: UI_SIZES.spacing.medium },
  codeStateText: { textAlign: 'center', marginTop: UI_SIZES.spacing.small },
  resendContainer: { justifyContent: 'flex-end' },
  issueText: { textAlign: 'center' },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: UI_SIZES.spacing.small,
    marginBottom: UI_SIZES.spacing.big,
  },
  resendText: { marginLeft: UI_SIZES.spacing.minor },
});
