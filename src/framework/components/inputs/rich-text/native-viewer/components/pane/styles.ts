import { ColorValue, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { RichContentPaneType } from '~/framework/components/inputs/rich-text/native-viewer/types';

export const PANE_COLORS: Record<RichContentPaneType, { background: ColorValue; icon: ColorValue }> = {
  [RichContentPaneType.INFO]: { background: theme.palette.complementary.blue.pale, icon: theme.palette.complementary.blue.regular },
  [RichContentPaneType.QUESTION]: {
    background: theme.palette.complementary.purple.pale,
    icon: theme.palette.complementary.purple.regular,
  },
  [RichContentPaneType.SUCCESS]: { background: theme.palette.status.success.pale, icon: theme.palette.status.success.regular },
  [RichContentPaneType.WARNING]: { background: theme.palette.status.warning.pale, icon: theme.palette.status.warning.regular },
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: UI_SIZES.spacing.minor,
  },
  pane: {
    borderRadius: UI_SIZES.radius.medium,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
    padding: UI_SIZES.spacing.small,
  },
});

export const getPaneStyle = (type: RichContentPaneType) => [styles.pane, { backgroundColor: PANE_COLORS[type].background }];

export default styles;
