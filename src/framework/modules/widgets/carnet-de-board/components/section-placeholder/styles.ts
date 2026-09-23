import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SECTION_ICON_SIZE } from '~/framework/modules/widgets/carnet-de-board/model';

export default StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.medium,
  },
  icon: {
    borderRadius: UI_SIZES.radius.newCard,
    height: SECTION_ICON_SIZE,
    width: SECTION_ICON_SIZE,
  },
  lines: {
    flex: 1,
    gap: UI_SIZES.spacing.tiny,
    justifyContent: 'center',
  },
  list: {
    gap: UI_SIZES.spacing.medium,
  },
});
