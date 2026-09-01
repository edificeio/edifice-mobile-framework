import { ImageURISource, ViewStyle } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
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
