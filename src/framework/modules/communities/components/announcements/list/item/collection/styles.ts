import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  calendarTop: {
    position: 'absolute',
    top: -getScaleWidth(6),
  },
  dateBadge: {
    alignItems: 'center',
    aspectRatio: 1,
    borderRadius: UI_SIZES.radius.newCard,
    justifyContent: 'center',
    width: getScaleWidth(56),
  },
  // Both texts get a line box as tall as their font size, otherwise the font's own leading and, on Android, its built-in padding pushes the month away from the day.
  day: {
    includeFontPadding: false,
    lineHeight: TextSizeStyle.Huge.fontSize,
  },
  distributedDate: {
    color: theme.palette.grey.graphite,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
  },
  month: {
    includeFontPadding: false,
    lineHeight: TextSizeStyle.Small.fontSize,
  },
  pill: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderRadius: UI_SIZES.radius.extraLarge,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
});
