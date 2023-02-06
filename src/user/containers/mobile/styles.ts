import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: { paddingHorizontal: UI_SIZES.spacing.medium },
  content: { textAlign: 'center', marginTop: UI_SIZES.spacing.medium },
  errorText: { color: theme.palette.status.failure.regular, marginTop: UI_SIZES.spacing.tiny },
  imageContainer: { paddingTop: UI_SIZES.spacing.medium, alignSelf: 'center' },
  input: {
    borderWidth: UI_SIZES.dimensions.width.tiny,
    marginTop: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
    borderRadius: UI_SIZES.radius.medium,
  },
  inputTitle: { marginLeft: UI_SIZES.spacing.minor },
  inputTitleContainer: { alignItems: 'center', marginTop: UI_SIZES.spacing.big, flexDirection: 'row' },
  logoutButton: { alignSelf: 'center', marginTop: UI_SIZES.spacing.medium },
  logoutText: { color: theme.palette.status.failure.regular },
  page: { backgroundColor: theme.ui.background.card },
  sendButton: { marginTop: UI_SIZES.spacing.medium },
  title: { textAlign: 'center', marginTop: UI_SIZES.spacing.medium },
});
