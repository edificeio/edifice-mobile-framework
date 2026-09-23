import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SECTION_ICON_SIZE } from '~/framework/modules/widgets/carnet-de-board/model';

export default StyleSheet.create({
  card: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.border.thin,
    gap: UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.medium,
  },
  empty: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  emptyText: {
    color: theme.ui.text.light,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
  },
  icon: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.newCard,
    height: SECTION_ICON_SIZE,
    justifyContent: 'center',
    width: SECTION_ICON_SIZE,
  },
  label: {
    flex: 1,
    marginRight: UI_SIZES.spacing.small,
  },
  labels: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
  },
});
