import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  sectionTitle: { color: theme.ui.text.light },
  itemTitle: {
    marginLeft: UI_SIZES.spacing.medium,
    marginRight: UI_SIZES.spacing.medium,
    marginVertical: UI_SIZES.spacing.small,
  },
  itemBullet: { color: theme.palette.complementary.orange.regular },
  listHeader: { marginTop: UI_SIZES.spacing.big, paddingHorizontal: UI_SIZES.spacing.medium },
});
