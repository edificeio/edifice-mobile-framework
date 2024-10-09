import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const DEFAULT_CARD_MIN_HEIGHT = getScaleWidth(60);
export const PIN_CARD_HEIGHT = getScaleWidth(100);
export const PIN_CARD_WIDTH = getScaleWidth(190);
export const PREVIEW_CARD_WIDTH = getScaleWidth(120);

export const defaultStyles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    columnGap: UI_SIZES.spacing.minor,
  },
  imageContainer: {
    height: '100%',
    width: DEFAULT_CARD_MIN_HEIGHT,
    borderTopLeftRadius: UI_SIZES.radius.card,
    borderBottomLeftRadius: UI_SIZES.radius.card,
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: UI_SIZES.spacing.minor,
    marginVertical: UI_SIZES.spacing.minor,
  },
  mainContainer: {
    flexDirection: 'row',
    minHeight: DEFAULT_CARD_MIN_HEIGHT,
  },
  secondaryText: {
    flex: 1,
    color: theme.ui.text.light,
  },
});

export const pinStyles = StyleSheet.create({
  highlightContainer: {
    flexDirection: 'row',
    flexShrink: 1,
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.tiny,
    marginRight: 'auto',
  },
  imageContainer: {
    width: getScaleWidth(60),
  },
  lightText: {
    flexShrink: 1,
    color: theme.ui.text.light,
  },
  lowerContainer: {
    flexDirection: 'row',
    columnGap: UI_SIZES.spacing.minor,
  },
  mainContainer: {
    width: PIN_CARD_WIDTH,
    height: PIN_CARD_HEIGHT,
    padding: UI_SIZES.spacing.minor,
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  topContainer: {
    flex: 1,
    flexDirection: 'row',
    columnGap: UI_SIZES.spacing.minor,
  },
});

export const previewStyles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    columnGap: UI_SIZES.spacing.minor,
  },
  imageContainer: {
    flex: 1,
    height: 'auto',
    width: '100%',
  },
  mainContainer: {
    width: PREVIEW_CARD_WIDTH,
    height: PREVIEW_CARD_WIDTH,
    padding: UI_SIZES.spacing.minor,
    rowGap: UI_SIZES.spacing.tiny,
  },
});
