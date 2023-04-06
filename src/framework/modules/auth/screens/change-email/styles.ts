import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  container: { paddingHorizontal: UI_SIZES.spacing.medium },
  content: { textAlign: 'center', marginTop: UI_SIZES.spacing.medium },
  errorText: { color: theme.palette.status.failure.regular, marginTop: UI_SIZES.spacing.tiny },
  imageContainer: { paddingTop: UI_SIZES.spacing.medium, alignSelf: 'center' },
  input: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingTop: UI_SIZES.spacing.small,
    paddingBottom: UI_SIZES.spacing.small + UI_SIZES.spacing.medium, // Hack to have padding + negative margin to have auto scroll with offset
    marginBottom: -UI_SIZES.spacing.medium,
    fontSize: TextSizeStyle.Medium.fontSize,
    lineHeight: undefined,
  },
  inputTitle: { marginLeft: UI_SIZES.spacing.minor },
  inputTitleContainer: { alignItems: 'center', marginTop: UI_SIZES.spacing.big, flexDirection: 'row' },
  inputWrapper: {
    overflow: 'hidden',
    marginTop: UI_SIZES.spacing.minor,
    borderWidth: UI_SIZES.dimensions.width.tiny,
    borderRadius: UI_SIZES.radius.medium,
  },
  logoutButton: { alignSelf: 'center', marginTop: UI_SIZES.spacing.medium },
  logoutText: { color: theme.palette.status.failure.regular },
  page: { backgroundColor: theme.ui.background.card },
  sendButton: { marginTop: UI_SIZES.spacing.medium },
  title: { textAlign: 'center', marginTop: UI_SIZES.spacing.medium },
});
