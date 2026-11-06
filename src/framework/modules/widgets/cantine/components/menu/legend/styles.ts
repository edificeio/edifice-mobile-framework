import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  allergens: {
    color: theme.palette.cantine.allergens,
  },
  container: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.medium,
    marginVertical: UI_SIZES.spacing.large,
    padding: UI_SIZES.spacing.medium,
  },
  icon: {
    height: UI_SIZES.elements.icon.xsmall,
    marginRight: UI_SIZES.spacing.tiny,
    width: UI_SIZES.elements.icon.xsmall,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
  },
  rows: {
    gap: UI_SIZES.spacing.tiny,
    marginBottom: UI_SIZES.spacing.tiny,
  },
  text: {
    ...TextSizeStyle.Small,
    color: theme.palette.grey.black,
    flex: 1,
  },
  title: {
    ...TextSizeStyle.Normal,
    color: theme.palette.grey.black,
    marginBottom: UI_SIZES.spacing.tiny,
  },
});
