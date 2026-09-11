import { ImageURISource, ViewStyle } from 'react-native';

import { DiscussionIcon } from '@edifice.io/community-client-rest-rn';

import theme, { IShades } from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SvgIconName } from '~/framework/components/picture';
import { COMMUNITY_DEFAULT_THUMBNAIL_IMAGE_SIZE } from '~/framework/modules/communities/adapter';
import { CommunityDetails } from '~/framework/modules/communities/store';
import { toURISource } from '~/framework/modules/media';

export const getCommunityBannerImage = (community?: Pick<CommunityDetails, 'image' | 'mobileThumbnails'>): ImageURISource[] => {
  if (community?.mobileThumbnails?.length)
    return community.mobileThumbnails.map(src => ({ ...src, ...COMMUNITY_DEFAULT_THUMBNAIL_IMAGE_SIZE }));
  return community?.image ? [toURISource(community.image)] : [];
};

export const getItemSeparatorStyle = (index: number, totalLength: number, separatorStyle: ViewStyle) => {
  const isLastItem = index === totalLength - 1;
  return isLastItem ? undefined : separatorStyle;
};

export const ESTIMATED_LIST_SIZE = {
  height: UI_SIZES.getViewHeight(),
  width: UI_SIZES.screen.width,
};

export type DiscussionTypeConfig = {
  color: IShades;
  icon: SvgIconName;
};

export const DISCUSSION_TYPE_CONFIG: Record<DiscussionIcon, DiscussionTypeConfig> = {
  [DiscussionIcon.DISCUSSION]: { color: theme.palette.complementary.blue, icon: 'ui-conversation' },
  [DiscussionIcon.EVENT]: { color: theme.palette.complementary.green, icon: 'ui-calendarLight' },
  [DiscussionIcon.IMPORTANT]: { color: theme.palette.complementary.orange, icon: 'ui-arrow-important' },
  [DiscussionIcon.OTHER]: { color: theme.palette.complementary.yellow, icon: 'ui-topic-other' },
  [DiscussionIcon.QUESTION]: { color: theme.palette.complementary.purple, icon: 'ui-question' },
};
