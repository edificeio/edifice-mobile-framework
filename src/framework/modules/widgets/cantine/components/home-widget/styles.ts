import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { CANTINE_WIDGET_FADE_HEIGHT, CANTINE_WIDGET_MENU_MAX_HEIGHT } from '~/framework/modules/widgets/components/constants';

const CARD_BACKGROUND = String(theme.palette.grey.white);

export default StyleSheet.create({
  fade: {
    bottom: 0,
    experimental_backgroundImage: `linear-gradient(to bottom, ${CARD_BACKGROUND}00, ${CARD_BACKGROUND})`,
    height: CANTINE_WIDGET_FADE_HEIGHT,
    left: 0,
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
  },
  menu: {
    maxHeight: CANTINE_WIDGET_MENU_MAX_HEIGHT,
    overflow: 'hidden',
  },
  // the height a long menu is cut at, which the steps overflow, so that the card keeps its size.
  placeholder: {
    height: CANTINE_WIDGET_MENU_MAX_HEIGHT,
    overflow: 'hidden',
  },
  seeMore: {
    alignSelf: 'center',
  },
  structureName: {
    color: theme.palette.grey.graphite,
  },
});
