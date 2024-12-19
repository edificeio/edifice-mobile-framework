import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { pageGutterSize } from '~/framework/components/page';

export default StyleSheet.create({
  bodyInput: {
    color: theme.ui.text.regular,
    flexGrow: 1,
    padding: 0,
  },
  contentContainer: {
    backgroundColor: theme.palette.grey.white,
    flexGrow: 1,
    padding: pageGutterSize,
  },
  navBarActionsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  navBarSendAction: {
    alignItems: 'center',
    height: UI_SIZES.dimensions.width.hug,
    justifyContent: 'center',
    marginHorizontal: UI_SIZES.spacing.medium,
    width: UI_SIZES.dimensions.width.hug,
  },
  separatorContainer: {
    backgroundColor: theme.palette.grey.grey,
    height: 1,
    marginVertical: UI_SIZES.spacing.minor,
    width: '50%',
  },
  signatureInput: {
    color: theme.ui.text.regular,
    padding: 0,
  },
});
