import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const DEFAULT_CARD_HEIGHT = getScaleWidth(80);
export const DEFAULT_IMAGE_WIDTH = getScaleWidth(60);
export const PIN_CARD_HEIGHT = getScaleWidth(100);
export const PIN_CARD_WIDTH = getScaleWidth(190);
export const PREVIEW_CARD_WIDTH = getScaleWidth(120);

export const defaultStyles = StyleSheet.create({
  actionsContainer: {
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    marginTop: 'auto',
  },
  iconContainer: {
    alignSelf: 'flex-start',
    backgroundColor: theme.palette.grey.pearl,
    borderBottomLeftRadius: UI_SIZES.radius.card,
    borderTopRightRadius: UI_SIZES.radius.card,
    marginLeft: 'auto',
    marginRight: -UI_SIZES.spacing.minor,
    marginTop: -UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.tiny,
  },
  imageContainer: {
    borderBottomLeftRadius: UI_SIZES.radius.card,
    borderTopLeftRadius: UI_SIZES.radius.card,
    height: '100%',
    width: DEFAULT_IMAGE_WIDTH,
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: UI_SIZES.spacing.minor,
    marginVertical: UI_SIZES.spacing.minor,
  },
  lowerContainer: {
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    flexGrow: 1,
  },
  mainContainer: {
    flexDirection: 'row',
    height: DEFAULT_CARD_HEIGHT,
  },
  secondaryText: {
    color: theme.ui.text.light,
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    flexShrink: 1,
  },
  titleText: {
    flexShrink: 1,
    lineHeight: undefined,
  },
});

export const pinStyles = StyleSheet.create({
  copyActionContainer: {
    marginLeft: 'auto',
  },
  highlightContainer: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.tiny,
    flexDirection: 'row',
    flexShrink: 1,
  },
  imageContainer: {
    width: getScaleWidth(60),
  },
  lightText: {
    color: theme.ui.text.light,
    flexShrink: 1,
  },
  lowerContainer: {
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
  },
  mainContainer: {
    height: PIN_CARD_HEIGHT,
    padding: UI_SIZES.spacing.minor,
    width: PIN_CARD_WIDTH,
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  topContainer: {
    columnGap: UI_SIZES.spacing.minor,
    flex: 1,
    flexDirection: 'row',
  },
});

export const previewStyles = StyleSheet.create({
  actionsContainer: {
    alignSelf: 'flex-end',
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
  },
  imageContainer: {
    flex: 1,
    height: 'auto',
    width: '100%',
  },
  mainContainer: {
    height: PREVIEW_CARD_WIDTH,
    padding: UI_SIZES.spacing.minor,
    rowGap: UI_SIZES.spacing.tiny,
    width: PREVIEW_CARD_WIDTH,
  },
});
