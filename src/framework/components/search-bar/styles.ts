import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  clearButton: {
    height: '100%',
    paddingLeft: UI_SIZES.spacing.minor,
    paddingRight: UI_SIZES.spacing.small,
  },
  container: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.input,
    borderWidth: UI_SIZES.border.thin,
    flex: 1,
    flexDirection: 'row',
  },
  searchIcon: {
    marginLeft: UI_SIZES.spacing.small,
  },
  textInput: {
    color: theme.ui.text.regular,
    flex: 1,
    marginLeft: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
    ...TextSizeStyle.Medium,
  },
  textInputIOS: {
    lineHeight: 0, // fixes ios alignment
  },
});
