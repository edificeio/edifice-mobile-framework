import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  alertCard: {
    marginTop: UI_SIZES.spacing.tiny,
    marginBottom: UI_SIZES.spacing.big,
  },
  buttonWrapper: {
    marginBottom: UI_SIZES.spacing.big,
  },
  cguWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  cguText: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    flex: 1,
  },
  emailInput: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    fontSize: TextSizeStyle.Medium.fontSize,
    lineHeight: undefined,
  },
  errorMsg: {
    flexGrow: 0,
    marginTop: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
    alignSelf: 'center',
    color: theme.palette.status.failure.regular,
  },
  flexGrow1: { flexGrow: 1 },
  infos: { alignItems: 'center' },
  infosSubText: { textAlign: 'center', marginBottom: UI_SIZES.spacing.big },
  infosText: {
    textAlign: 'center',
    marginTop: UI_SIZES.spacing.medium,
    marginBottom: UI_SIZES.spacing.small,
  },
  inputContainer: {
    marginVertical: UI_SIZES.spacing.large,
  },
  page: {
    padding: UI_SIZES.spacing.big,
    backgroundColor: theme.palette.grey.white,
  },
  phoneInput: {
    borderWidth: 1,
    borderRadius: UI_SIZES.radius.medium,
    alignSelf: 'stretch',
  },
  phoneInputContainer: {
    marginTop: UI_SIZES.spacing.minor,
    marginBottom: UI_SIZES.spacing.small,
  },
  pressable: { flexGrow: 1 },
  safeArea: { flex: 1, backgroundColor: theme.ui.background.card },
  /**
   * Styles below are exclusively used for PhoneInput
   */
  dropDownArrow: {
    marginLeft: -UI_SIZES.spacing.tiny, // Hack to compensate fixed margins in the trid-party package
  },
  errorText: { color: theme.palette.status.failure.regular, marginTop: UI_SIZES.spacing.tiny },
  flagButton: {
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.small,
  },
  flagCode: { color: theme.ui.text.regular, ...TextSizeStyle.Medium },
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
});
