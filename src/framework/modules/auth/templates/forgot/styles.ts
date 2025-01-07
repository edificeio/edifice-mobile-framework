import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  buttonWrapper: {
    marginTop: UI_SIZES.spacing.major,
    marginBottom: UI_SIZES.spacing.big,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-around',
    paddingVertical: UI_SIZES.spacing.minor,
  },
  dropdownInput: {
    ...TextSizeStyle.Medium,
    backgroundColor: theme.ui.background.card,
    borderRadius: UI_SIZES.radius.input,
    borderWidth: 1,
    borderColor: theme.palette.primary.regular,
    color: theme.ui.text.regular,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  dropdownItems: {
    borderLeftWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.small,
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
    flex: 1,
  },
  errorMsg: {
    alignSelf: 'center',
    color: theme.palette.status.failure.regular,
    flexGrow: 0,
    marginVertical: UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
  },
  infos: {
    alignItems: 'center',
  },
  img: {
    height: UI_SIZES.elements.thumbnail,
    width: UI_SIZES.elements.thumbnail,
  },
  infosText: {
    marginTop: UI_SIZES.spacing.large,
    textAlign: 'center',
  },
  inputContainer: {
    marginTop: UI_SIZES.spacing.major,
  },
  page: {
    backgroundColor: theme.palette.grey.white,
    paddingBottom: -UI_SIZES.elements.tabbarHeight,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.big,
    flexDirection: 'column',
    display: 'flex',
  },
  select: {
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
  },
  selectPlaceholder: { color: theme.ui.text.light },
  selectText: { color: theme.ui.text.light },
  successMsg: {
    alignSelf: 'center',
    marginTop: UI_SIZES.spacing.major,
    marginBottom: UI_SIZES.spacing.large,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
  },
});
