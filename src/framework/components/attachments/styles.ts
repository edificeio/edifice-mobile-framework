import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  attachments: {
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: UI_SIZES.spacing.minor,
  },
  button: {
    alignSelf: 'baseline',
  },
  container: {
    alignItems: 'flex-start',
    backgroundColor: theme.palette.grey.fog,
    borderColor: theme.palette.primary.light,
    borderRadius: UI_SIZES.radius.selector,
    borderStyle: 'dashed',
    borderWidth: UI_SIZES.border.thin,
    padding: UI_SIZES.spacing.minor,
  },
});
