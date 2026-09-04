import theme from '~/app/theme';
import { getScaleWidth } from '~/framework/components/constants';

export const WIDGET_ICON_SIZE = 36;
export const WIDGET_ICON_INNER_SIZE = getScaleWidth(20);

export const WIDGET_BORDER_COLOR = theme.palette.complementary.yellow.light;
export const WIDGET_EMPTY_IMAGE_SIZE = 96;

export const BLOCK_COLORS = {
  homework: {
    background: theme.palette.complementary.green.pale,
    borders: theme.palette.complementary.green.light,
    icon: theme.palette.complementary.green.dark,
  },
  lateness: {
    background: theme.palette.complementary.orange.pale,
    borders: theme.palette.complementary.orange.light,
    icon: theme.palette.complementary.orange.dark,
  },
  note: {
    background: theme.palette.complementary.blue.pale,
    borders: theme.palette.complementary.blue.light,
    icon: theme.palette.complementary.blue.dark,
  },
  skill: {
    background: theme.palette.complementary.purple.pale,
    borders: theme.palette.complementary.purple.light,
    icon: theme.palette.complementary.purple.dark,
  },
} as const;
