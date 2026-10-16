import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  container: { paddingHorizontal: UI_SIZES.spacing.medium },
  content: { marginTop: UI_SIZES.spacing.medium, textAlign: 'center' },
  errorText: { color: theme.palette.status.failure.regular, marginTop: UI_SIZES.spacing.tiny },
  imageContainer: { alignSelf: 'center', paddingTop: UI_SIZES.spacing.medium },
  input: {
    fontSize: TextSizeStyle.Medium.fontSize,
    lineHeight: undefined,
    // Hack to have padding + negative margin to have auto scroll with offset
    marginBottom: -UI_SIZES.spacing.medium,

    paddingBottom: UI_SIZES.spacing.small + UI_SIZES.spacing.medium,

    paddingHorizontal: UI_SIZES.spacing.medium,

    paddingTop: UI_SIZES.spacing.small,
  },
  inputTitle: { marginLeft: UI_SIZES.spacing.minor },
  inputTitleContainer: { alignItems: 'center', flexDirection: 'row', marginTop: UI_SIZES.spacing.big },
  inputWrapper: {
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.dimensions.width.tiny,
    marginTop: UI_SIZES.spacing.minor,
    overflow: 'hidden',
  },
  logoutButton: { alignSelf: 'center', marginTop: UI_SIZES.spacing.medium },
  logoutText: { color: theme.palette.status.failure.regular },
  page: { backgroundColor: theme.ui.background.card },
  sendButton: { marginTop: UI_SIZES.spacing.medium },
  title: { marginTop: UI_SIZES.spacing.medium, textAlign: 'center' },
});
