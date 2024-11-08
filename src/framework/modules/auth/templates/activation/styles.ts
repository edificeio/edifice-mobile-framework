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

  flexGrow1: { flexGrow: 1 },

  infos: { alignItems: 'center' },

  infosSubText: { marginBottom: UI_SIZES.spacing.big, textAlign: 'center' },

  infosText: {
    marginBottom: UI_SIZES.spacing.small,
    marginTop: UI_SIZES.spacing.medium,
    textAlign: 'center',
  },

  inputContainer: {
    marginVertical: UI_SIZES.spacing.large,
  },

  page: {
    backgroundColor: theme.palette.grey.white,
    paddingBottom: -UI_SIZES.elements.tabbarHeight,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.big,
  },

  phoneInputContainer: {
    marginBottom: UI_SIZES.spacing.small,
    marginTop: UI_SIZES.spacing.minor,
  },

  pressable: { flexGrow: 1 },
  safeArea: { backgroundColor: theme.ui.background.card, flex: 1 },
});
