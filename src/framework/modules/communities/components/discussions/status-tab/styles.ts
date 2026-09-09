import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { DiscussionIcon } from '@edifice.io/community-client-rest-rn';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { DISCUSSION_TYPE_CONFIG } from '~/framework/modules/communities/utils';

const styles = StyleSheet.create({
  clip: {
    alignSelf: 'flex-start',
    marginHorizontal: UI_SIZES.spacing.big,
    overflow: 'hidden',
  },
  dashedBorder: {
    borderStyle: 'dashed',
  },
  /** Keep the 4 borders with same width AND color, otherwise Android ignores the dashed border. */
  tab: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.palette.grey.white,
    borderBottomLeftRadius: UI_SIZES.radius.card,
    borderBottomRightRadius: UI_SIZES.radius.card,
    borderWidth: UI_SIZES.border.small,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    marginTop: -UI_SIZES.border.small,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  text: {
    color: theme.palette.grey.graphite,
  },
});

export const TAB_STYLES = Object.fromEntries(
  (Object.keys(DISCUSSION_TYPE_CONFIG) as DiscussionIcon[]).map(type => [
    type,
    [styles.tab, { borderColor: DISCUSSION_TYPE_CONFIG[type].color.light }],
  ]),
) as Record<DiscussionIcon, StyleProp<ViewStyle>>;

export default styles;
