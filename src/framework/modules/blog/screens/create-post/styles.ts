import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextFontStyle, TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  inputTitle: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: UI_SIZES.spacing.small,
    borderRadius: 0,
    borderWidth: 0,
    borderBottomWidth: 1,
    minHeight: TextSizeStyle.Big.lineHeight + UI_SIZES.spacing.small,
    ...TextSizeStyle.Big,
    ...TextFontStyle.Bold,
    color: theme.palette.grey.black,
  },
});
