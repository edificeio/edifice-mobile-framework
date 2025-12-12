import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  attachmentsContainer: {
    flexDirection: 'column',
    gap: UI_SIZES.spacing.tiny,
  },
  iconCard: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.medium,
    justifyContent: 'center',
    minHeight: getScaleWidth(80),
  },
  titleCard: {
    backgroundColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.medium,
    justifyContent: 'center',
    minHeight: getScaleWidth(44),
    paddingHorizontal: UI_SIZES.spacing.small,
  },
});
