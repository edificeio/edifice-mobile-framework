import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const DEFAULT_CARD_MIN_HEIGHT = getScaleWidth(60);

export const previewStyles = StyleSheet.create({
  mainContainer: {
    width: getScaleWidth(120),
    height: getScaleWidth(120),
  },
  upperContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.tiny,
  },
  titleText: {
    color: theme.palette.primary.regular,
    flexShrink: 1,
    marginRight: UI_SIZES.spacing.tiny,
  },
  lowerContentContainer: {
    flexDirection: 'row',
  },
  imageContainer: {
    height: 70,
    width: 50,
  },
  secondaryContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginLeft: UI_SIZES.spacing.minor,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

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
