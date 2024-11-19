import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextFontStyle, TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  inputTitle: {
    borderBottomWidth: 1,
    borderRadius: 0,
    borderWidth: 0,
    minHeight: TextSizeStyle.Big.lineHeight + UI_SIZES.spacing.small,
    paddingBottom: UI_SIZES.spacing.small,
    paddingHorizontal: 0,
    paddingTop: 0,
    ...TextSizeStyle.Big,
    ...TextFontStyle.Bold,
    color: theme.palette.grey.black,
  },
  page: {
    padding: UI_SIZES.spacing.medium,
    paddingBottom: 0,
  },
});
