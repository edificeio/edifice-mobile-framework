import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const FILTER_ICON_SIZE = getScaleWidth(24);

export default StyleSheet.create({
  intro: {
    color: theme.palette.grey.graphite,
    paddingBottom: UI_SIZES.spacing.small,
  },
  page: {
    flex: 1,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingTop: UI_SIZES.spacing.medium,
  },
  row: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.grey,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  rowChecked: {
    backgroundColor: theme.palette.primary.pale,
    borderColor: theme.palette.primary.light,
  },
  rowLabel: {
    flex: 1,
  },
  selectAll: {
    alignItems: 'center',
    borderColor: theme.palette.grey.grey,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  selectAllRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
    paddingBottom: UI_SIZES.spacing.medium,
  },
  separator: {
    height: UI_SIZES.spacing.minor,
  },
});
