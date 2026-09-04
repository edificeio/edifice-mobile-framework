import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { WIDGET_BORDER_COLOR } from '~/framework/modules/widgets/carnet-de-board/components/home-widget/constants';
import { SECTION_ICON_SIZE } from '~/framework/modules/widgets/carnet-de-board/model/sections';

export default StyleSheet.create({
  body: {
    backgroundColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.mediumPlus,
  },
  empty: {
    alignItems: 'center',
    gap: UI_SIZES.spacing.small,
    padding: UI_SIZES.spacing.medium,
  },
  emptyText: {
    textAlign: 'center',
  },
  icon: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.newCard,
    borderWidth: UI_SIZES.border.thin,
    height: SECTION_ICON_SIZE,
    justifyContent: 'center',
    width: SECTION_ICON_SIZE,
  },
  sectionCard: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderColor: WIDGET_BORDER_COLOR,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.minor,
  },
  sectionCardEmpty: {
    color: theme.ui.text.light,
  },
  sectionCardText: {
    flex: 1,
  },
  sections: {
    gap: UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.minor,
  },
});
