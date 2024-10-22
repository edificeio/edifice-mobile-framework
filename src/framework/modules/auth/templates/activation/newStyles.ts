import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  alertCard: {
    marginBottom: UI_SIZES.spacing.big,
    marginTop: UI_SIZES.spacing.tiny,
  },
  buttonWrapper: {
    marginBottom: UI_SIZES.spacing.big,
  },
  cguText: {
    alignItems: 'baseline',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cguWrapper: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
  },
  emailInput: {
    fontSize: TextSizeStyle.Medium.fontSize,
    lineHeight: undefined,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  errorMsg: {
    alignSelf: 'center',
    color: theme.palette.status.failure.regular,
    flexGrow: 0,
    marginTop: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
  },
  /**
   * Styles below are exclusively used for PhoneInput
   */
  dropDownArrow: {
    marginLeft: -UI_SIZES.spacing.tiny, // Hack to compensate fixed margins in the trid-party package
  },

  flexGrow1: { flexGrow: 1 },

  infos: { alignItems: 'center' },

  errorText: { color: theme.palette.status.failure.regular, marginTop: UI_SIZES.spacing.tiny },

  infosSubText: { marginBottom: UI_SIZES.spacing.big, textAlign: 'center' },

  flagButton: {
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.small,
  },

  infosText: {
    marginBottom: UI_SIZES.spacing.small,
    marginTop: UI_SIZES.spacing.medium,
    textAlign: 'center',
  },

  flagCode: { color: theme.ui.text.regular, ...TextSizeStyle.Medium },

  inputContainer: {
    marginVertical: UI_SIZES.spacing.large,
  },

  // We allow use of 'transparent' to erase default color provided by third-party component
  // eslint-disable-next-line react-native/no-color-literals
  inputTextContainer: {
    backgroundColor: 'transparent',
    borderLeftWidth: 1,
    overflow: 'hidden',
  },

  page: {
    backgroundColor: theme.palette.grey.white,
    padding: UI_SIZES.spacing.big,
  },

  phoneInput: {
    alignSelf: 'stretch',
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: 1,
  },

  inputTextInput: {
    color: theme.ui.text.regular,
    fontSize: TextSizeStyle.Medium.fontSize,
    lineHeight: undefined,
    // Hack to have padding + negative margin to have auto scroll with offset
    marginVertical: 2 - UI_SIZES.spacing.tiny - 1 - UI_SIZES.spacing.big,

    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.tiny + UI_SIZES.spacing.tiny + 1 + UI_SIZES.spacing.big, // Hack to compensate the position of TextInput baseline compared to regular text.
  },

  phoneInputContainer: {
    marginBottom: UI_SIZES.spacing.small,
    marginTop: UI_SIZES.spacing.minor,
  },

  pressable: { flexGrow: 1 },
  safeArea: { backgroundColor: theme.ui.background.card, flex: 1 },
});
