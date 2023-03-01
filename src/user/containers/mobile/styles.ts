import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  container: { paddingHorizontal: UI_SIZES.spacing.medium, alignItems: 'stretch' },
  content: { textAlign: 'center', marginTop: UI_SIZES.spacing.medium },
  dropDownArrow: {
    marginLeft: -UI_SIZES.spacing.tiny, // Hack to compensate fixed margins in the trid-party package
  },
  errorText: { color: theme.palette.status.failure.regular, marginTop: UI_SIZES.spacing.tiny },
  flagButton: {
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.small,
  },
  flagCode: {
    color: theme.ui.text.regular,
    ...TextSizeStyle.Medium,
  },
  imageContainer: { paddingTop: UI_SIZES.spacing.medium, alignSelf: 'center' },
  input: {
    borderWidth: 1,
    borderRadius: UI_SIZES.radius.medium,
    alignSelf: 'stretch',
    marginVertical: UI_SIZES.spacing.minor,
  },
  // We allow use of 'transparent' to erase default color provided by third-party component
  // eslint-disable-next-line react-native/no-color-literals
  inputTextContainer: {
    borderLeftWidth: 1,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  inputTextInput: {
    color: theme.ui.text.regular,
    fontSize: TextSizeStyle.Medium.fontSize,
    paddingHorizontal: UI_SIZES.spacing.small,
    lineHeight: undefined,
    paddingVertical: UI_SIZES.spacing.tiny + UI_SIZES.spacing.tiny + 1 + UI_SIZES.spacing.big, // Hack to have padding + negative margin to have auto scroll with offset
    marginVertical: 2 - UI_SIZES.spacing.tiny - 1 - UI_SIZES.spacing.big, // Hack to compensate the position of TextInput baseline compared to regular text.
  },
  inputTitle: { marginLeft: UI_SIZES.spacing.minor },
  inputTitleContainer: { alignItems: 'center', marginTop: UI_SIZES.spacing.big, flexDirection: 'row' },
  logoutButton: { alignSelf: 'center', marginTop: UI_SIZES.spacing.medium },
  logoutText: { color: theme.palette.status.failure.regular },
  page: { backgroundColor: theme.ui.background.card },
  sendButton: { marginTop: UI_SIZES.spacing.medium },
  title: { textAlign: 'center', marginTop: UI_SIZES.spacing.medium },
});
