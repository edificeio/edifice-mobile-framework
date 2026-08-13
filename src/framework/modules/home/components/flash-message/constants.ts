import theme from '~/app/theme';
import type { IEntcoreFlashMessage } from '~/framework/modules/timeline/reducer/flash-messages';

import type { FlashMessageTint } from './types';

/**
 * levels of message, named by intent. Each one carries the background of the card, and the accent
 * shared by its border and the circle of its icon.
 */
export const TINTS = {
  alert: {
    accent: theme.palette.status.failure.regular,
    // confirm befor adding to theme,cause dosn't exist yet in theme
    arc: '#FFBDBD',
    background: theme.palette.status.failure.pale,
    icon: 'ui-alert-triangle',
  },
  info: {
    accent: theme.palette.complementary.blue.regular,
    arc: theme.palette.complementary.blue.light,
    background: theme.palette.complementary.blue.pale,
    icon: 'ui-infoCircle',
  },
  neutral: {
    accent: theme.palette.grey.grey,
    arc: theme.palette.grey.cloudy,
    background: theme.palette.grey.pearl,
    icon: 'ui-infoCircle',
  },
  success: {
    accent: theme.palette.complementary.green.dark,
    arc: theme.palette.complementary.green.light,
    background: theme.palette.complementary.green.pale,
    icon: 'ui-infoCircle',
  },
  warning: {
    accent: theme.palette.complementary.yellow.regular,
    arc: theme.palette.complementary.yellow.light,
    background: theme.palette.complementary.yellow.pale,
    icon: 'ui-infoCircle',
  },
} satisfies Record<string, FlashMessageTint>;

export const MESSAGE_TINTS: Record<NonNullable<IEntcoreFlashMessage['color']>, FlashMessageTint> = {
  'blue': TINTS.info,
  'green': TINTS.success,
  'grey-dark': TINTS.neutral,
  'orange': TINTS.warning,
  'red': TINTS.alert,
};
