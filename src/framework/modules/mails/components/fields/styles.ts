import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  textButton: {
    color: theme.palette.primary.regular,
  },
  container: {
    alignItems: 'flex-start',
    borderBottomWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.primary.light,
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
  input: {
    ...TextSizeStyle.Medium,
    lineHeight: undefined,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  middlePart: {
    flex: 1,
    rowGap: UI_SIZES.spacing.minor,
  },
  prefix: {
    color: theme.palette.grey.graphite,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  recipientsList: {
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: UI_SIZES.spacing.minor,
  },
  nbResults: {
    marginBottom: UI_SIZES.spacing.small,
  },
  results: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
});
