import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { pageGutterSize } from '~/framework/components/page';

export default StyleSheet.create({
  bodyInput: {
    flexGrow: 1,
    color: theme.ui.text.regular,
    padding: 0,
  },
  contentContainer: {
    flexGrow: 1,
    padding: pageGutterSize,
    backgroundColor: theme.palette.grey.white,
  },
  navBarActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBarSendAction: {
    marginHorizontal: UI_SIZES.spacing.medium,
  },
  separatorContainer: {
    width: '50%',
    height: 1,
    backgroundColor: theme.palette.grey.grey,
    marginVertical: UI_SIZES.spacing.minor,
  },
  signatureInput: {
    color: theme.ui.text.regular,
    padding: 0,
  },
});
