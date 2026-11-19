import { StyleSheet } from 'react-native';

import theme, { type ThemeColorName } from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.newCard,
    borderWidth: getScaleWidth(0.85),
    height: getScaleWidth(88),
    justifyContent: 'center',
    position: 'relative',
    width: getScaleWidth(88),
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  favoriteIcon: {
    left: -getScaleWidth(15),
    padding: UI_SIZES.spacing.tiny,
    position: 'absolute',
    top: -UI_SIZES.spacing.medium,
    zIndex: UI_SIZES.spacing.tinyExtra,
  },
  image: {
    borderRadius: UI_SIZES.radius.newCard,
    height: '100%',
    objectFit: 'fill',
    width: '100%',
  },
  letterFallbackStyle: {
    color: theme.ui.text.inverse,
    fontSize: UI_SIZES.spacing.large,
    includeFontPadding: false,
    lineHeight: UI_SIZES.spacing.large * 1.2,
    textAlignVertical: 'center',
  },
  title: {
    textAlign: 'center',
  },
  titleRow: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.tiny,
    flexDirection: 'row',
    marginTop: UI_SIZES.spacing.small,
  },
  wrapper: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.newCard,
    minHeight: getScaleWidth(134),
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.small,
    width: getScaleWidth(168),
  },
  wrapperPressed: {
    backgroundColor: theme.palette.grey.cloudy,
  },
});

/** The main shade of a color of the palette. */
const getRegularColor = (color: ThemeColorName | undefined) => {
  if (color === undefined) return undefined;
  return color === 'primary' || color === 'secondary' ? theme.palette[color].regular : theme.palette.complementary[color].regular;
};

/** @param color the color of the app: the background of its card. */
export const getCardBackgroundStyle = (color?: ThemeColorName) => ({ backgroundColor: getRegularColor(color) });
