import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  button: {
    padding: UI_SIZES.spacing.tiny,
  },
  buttonOpen: {
    transform: [{ rotate: '180deg' }],
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
    paddingVertical: UI_SIZES.spacing.tinyExtra,
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
});
